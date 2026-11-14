import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import {
  calculateOrderTotals,
  generateOrderNumber,
  validatePhoneNumber,
  ORDER_STATUSES,
  OrderStatus,
} from './src/utils/ordering';
import { Order, OrderItem } from './src/types/restaurant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // Request logger for API calls
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Authentication Middleware for Admin routes
  const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
      return;
    }

    const token = authHeader.substring(7).trim();
    const isValid = db.validateSessionToken(token);
    if (!isValid) {
      res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
      return;
    }

    next();
  };

  // --- PUBLIC API ROUTES ---

  // 1. Menu
  app.get('/api/menu', (req: Request, res: Response) => {
    const items = db.getMenuItems();
    res.json(items);
  });

  app.get('/api/menu/:id', (req: Request, res: Response) => {
    const item = db.getMenuItemById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Food item not found' });
      return;
    }
    res.json(item);
  });

  // 2. Settings (Public view, secret keys hidden)
  app.get('/api/settings', (req: Request, res: Response) => {
    const settings = db.getSettings(false);
    res.json(settings);
  });

  // 3. Orders: Submit an order
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      deliveryAddress,
      specialInstructions,
      items,
      paymentMethod,
    } = req.body;

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      res.status(400).json({ error: 'Customer name is required' });
      return;
    }

    const phoneValidation = validatePhoneNumber(customerPhone);
    if (!phoneValidation.isValid) {
      res.status(400).json({ error: phoneValidation.error || 'Valid phone number is required' });
      return;
    }

    if (orderType !== 'delivery' && orderType !== 'pickup') {
      res.status(400).json({ error: 'Order type must be delivery or pickup' });
      return;
    }

    if (orderType === 'delivery' && (!deliveryAddress || !deliveryAddress.trim())) {
      res.status(400).json({ error: 'Delivery address is required for delivery orders' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one food item' });
      return;
    }

    // Verify items and prices from database to prevent client manipulation
    const verifiedItems: OrderItem[] = [];
    const allMenuItems = db.getMenuItems();

    for (const rawItem of items) {
      const dbItem = allMenuItems.find((m) => m.id === rawItem.menuItemId);
      if (!dbItem) {
        res.status(400).json({ error: `Dish with ID ${rawItem.menuItemId} does not exist.` });
        return;
      }
      if (!dbItem.isAvailable) {
        res.status(400).json({ error: `"${dbItem.name}" is currently sold out.` });
        return;
      }

      const qty = Math.max(1, Math.floor(rawItem.quantity || 1));
      verifiedItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        image: dbItem.image,
        specialNotes: rawItem.specialNotes ? String(rawItem.specialNotes).substring(0, 200) : undefined,
      });
    }

    const settings = db.getSettings(true);
    const totals = calculateOrderTotals(
      verifiedItems,
      orderType,
      settings.standardDeliveryFee,
      settings.freeDeliveryThreshold
    );

    const validPaymentMethods = ['pay_on_delivery', 'pay_on_pickup', 'paystack'];
    const chosenPaymentMethod = validPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : orderType === 'delivery'
      ? 'pay_on_delivery'
      : 'pay_on_pickup';

    const orderNumber = generateOrderNumber();
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: phoneValidation.normalized || customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : undefined,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : 'Pickup in Restaurant',
      specialInstructions: specialInstructions ? specialInstructions.trim() : undefined,
      items: verifiedItems,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      totalAmount: totals.totalAmount,
      paymentMethod: chosenPaymentMethod,
      paymentStatus: 'unpaid',
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedOrder = db.createOrder(newOrder);
    res.status(201).json(savedOrder);
  });

  // 4. Orders: Lookup by Order ID or Order Number
  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found. Please verify your order number.' });
      return;
    }
    res.json(order);
  });

  // 5. Paystack Payment Verification
  app.post('/api/orders/:id/verify-paystack', async (req: Request, res: Response) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const { reference } = req.body;
    if (!reference) {
      res.status(400).json({ error: 'Payment transaction reference is required' });
      return;
    }

    const settings = db.getSettings(true);
    const secretKey = settings.paystack?.secretKey;

    // Secure verification: if live secret key configured and not a placeholder, call Paystack API
    if (
      secretKey &&
      secretKey.startsWith('sk_') &&
      !secretKey.includes('sample') &&
      !secretKey.includes('YOUR_')
    ) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        });
        const data = await response.json();

        if (data.status && data.data && data.data.status === 'success') {
          // Expected amount in kobo (Naira * 100)
          const expectedKobo = order.totalAmount * 100;
          if (data.data.amount >= expectedKobo) {
            const updated = db.updateOrderStatus(order.id, 'Confirmed', 'paid');
            if (updated) updated.paystackReference = reference;
            db.save();
            res.json({ success: true, message: 'Payment verified successfully via Paystack', order: updated });
            return;
          } else {
            res.status(400).json({ error: 'Payment amount mismatch' });
            return;
          }
        } else {
          res.status(400).json({ error: 'Paystack transaction could not be verified' });
          return;
        }
      } catch (err) {
        console.error('Paystack verification error:', err);
        res.status(502).json({ error: 'Failed to contact Paystack verification servers' });
        return;
      }
    } else {
      // Test mode / demo configuration: Verify and confirm order with test reference
      const updated = db.updateOrderStatus(order.id, 'Confirmed', 'paid');
      if (updated) {
        updated.paystackReference = reference;
        db.save();
      }
      res.json({
        success: true,
        message: 'Payment recorded (Test/Demo mode active)',
        order: updated,
      });
    }
  });

  // 6. Reviews: Public list
  app.get('/api/reviews', (req: Request, res: Response) => {
    const reviews = db.getReviews(true);
    res.json(reviews);
  });

  // 7. Reviews: Customer submit
  app.post('/api/reviews', (req: Request, res: Response) => {
    const { customerName, rating, comment, dishOrdered } = req.body;
    if (!customerName || !customerName.trim()) {
      res.status(400).json({ error: 'Customer name is required' });
      return;
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
      return;
    }
    if (!comment || !comment.trim() || comment.trim().length < 5) {
      res.status(400).json({ error: 'Review comment must be at least 5 characters' });
      return;
    }

    const newReview = db.addReview({
      customerName: customerName.trim(),
      rating: Math.round(numRating),
      comment: comment.trim(),
      dishOrdered: dishOrdered ? dishOrdered.trim() : undefined,
    });

    res.status(201).json(newReview);
  });

  // 8. Gallery
  app.get('/api/gallery', (req: Request, res: Response) => {
    const items = db.getGallery();
    res.json(items);
  });

  // 9. Contact Message submission
  app.post('/api/contact', (req: Request, res: Response) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Your name is required' });
      return;
    }
    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const saved = db.addContactMessage({
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    res.status(201).json({ success: true, message: 'Message sent successfully. Our team will contact you shortly.', id: saved.id });
  });

  // 10. Admin: Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = db.verifyAdminCredentials(username, password);
    if (!result.success) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    res.json({
      success: true,
      token: result.token,
      user: result.user,
    });
  });

  // --- PROTECTED ADMIN ROUTES ---

  // Check current session
  app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
    res.json({
      authenticated: true,
      user: {
        username: 'admin',
        role: 'superadmin',
      },
    });
  });

  // Logout
  app.post('/api/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.substring(7).trim();
      db.revokeSessionToken(token);
    }
    res.json({ success: true });
  });

  // Change admin password
  app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters' });
      return;
    }

    const changed = db.changeAdminPassword(currentPassword, newPassword);
    if (!changed) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    res.json({ success: true, message: 'Password changed successfully. Please log in with your new password.' });
  });

  // Admin Dashboard Overview Stats
  app.get('/api/admin/stats', requireAdminAuth, (req: Request, res: Response) => {
    const orders = db.getOrders();
    const reviews = db.getReviews(false);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing').length;
    const completedOrders = orders.filter((o) => o.status === 'Delivered').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaysOrdersList = orders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const todaysOrders = todaysOrdersList.length;
    const todaysRevenue = todaysOrdersList
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    // Item popularity calculation
    const dishSales: Record<string, { name: string; category: string; orderCount: number; revenue: number }> = {};
    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
      for (const item of order.items) {
        if (!dishSales[item.name]) {
          dishSales[item.name] = { name: item.name, category: 'Menu', orderCount: 0, revenue: 0 };
        }
        dishSales[item.name].orderCount += item.quantity;
        dishSales[item.name].revenue += item.price * item.quantity;
      }
    }

    const popularDishes = Object.values(dishSales)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      todaysOrders,
      todaysRevenue,
      averageRating,
      totalReviews,
      popularDishes,
      recentOrders: orders.slice(0, 8),
    });
  });

  // Admin: Get all orders
  app.get('/api/admin/orders', requireAdminAuth, (req: Request, res: Response) => {
    const orders = db.getOrders();
    res.json(orders);
  });

  // Admin: Update order status
  app.put('/api/admin/orders/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const { status, paymentStatus } = req.body;
    if (!status || !ORDER_STATUSES.includes(status as OrderStatus)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` });
      return;
    }

    const updated = db.updateOrderStatus(req.params.id, status, paymentStatus);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(updated);
  });

  // Admin: Create Menu Item
  app.post('/api/admin/menu', requireAdminAuth, (req: Request, res: Response) => {
    const { name, category, description, price, image, isAvailable, preparationTime, spiciness, tags } = req.body;
    if (!name || !price || !category) {
      res.status(400).json({ error: 'Name, category, and price are required' });
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ error: 'Price must be a positive number' });
      return;
    }

    const newItem = db.addMenuItem({
      name: name.trim(),
      category,
      description: description ? description.trim() : '',
      price: Math.round(numPrice),
      image: image ? image.trim() : '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
      isAvailable: isAvailable !== false,
      isFeatured: Boolean(req.body.isFeatured),
      preparationTime: preparationTime ? preparationTime.trim() : '20 mins',
      spiciness: spiciness || 'Medium',
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json(newItem);
  });

  // Admin: Update Menu Item
  app.put('/api/admin/menu/:id', requireAdminAuth, (req: Request, res: Response) => {
    const updates = { ...req.body };
    if (updates.price !== undefined) {
      updates.price = Math.round(Number(updates.price));
      if (isNaN(updates.price) || updates.price <= 0) {
        res.status(400).json({ error: 'Valid price is required' });
        return;
      }
    }

    const updated = db.updateMenuItem(req.params.id, updates);
    if (!updated) {
      res.status(404).json({ error: 'Food item not found' });
      return;
    }

    res.json(updated);
  });

  // Admin: Delete Menu Item
  app.delete('/api/admin/menu/:id', requireAdminAuth, (req: Request, res: Response) => {
    const deleted = db.deleteMenuItem(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Food item not found' });
      return;
    }
    res.json({ success: true, message: 'Dish removed successfully' });
  });

  // Admin: Get all reviews (including pending/rejected)
  app.get('/api/admin/reviews', requireAdminAuth, (req: Request, res: Response) => {
    const reviews = db.getReviews(false);
    res.json(reviews);
  });

  // Admin: Update review status
  app.put('/api/admin/reviews/:id/status', requireAdminAuth, (req: Request, res: Response) => {
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'Status must be approved, pending, or rejected' });
      return;
    }

    const updated = db.updateReviewStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    res.json(updated);
  });

  // Admin: Delete review
  app.delete('/api/admin/reviews/:id', requireAdminAuth, (req: Request, res: Response) => {
    const deleted = db.deleteReview(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ success: true });
  });

  // Admin: Add Gallery Item
  app.post('/api/admin/gallery', requireAdminAuth, (req: Request, res: Response) => {
    const { title, category, imageUrl, description } = req.body;
    if (!title || !imageUrl) {
      res.status(400).json({ error: 'Title and image URL are required' });
      return;
    }

    const newItem = db.addGalleryItem({
      title: title.trim(),
      category: category || 'Nigerian Meals',
      imageUrl: imageUrl.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json(newItem);
  });

  // Admin: Delete Gallery Item
  app.delete('/api/admin/gallery/:id', requireAdminAuth, (req: Request, res: Response) => {
    const deleted = db.deleteGalleryItem(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Gallery item not found' });
      return;
    }
    res.json({ success: true });
  });

  // Admin: Get full settings with private keys
  app.get('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
    const settings = db.getSettings(true);
    res.json(settings);
  });

  // Admin: Update restaurant settings
  app.put('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  });

  // Admin: View customer contact messages
  app.get('/api/admin/contact-messages', requireAdminAuth, (req: Request, res: Response) => {
    const msgs = db.getContactMessages();
    res.json(msgs);
  });

  // --- VITE DEV / PRODUCTION INTEGRATION ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[THE FUTURE KITCHEN] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
