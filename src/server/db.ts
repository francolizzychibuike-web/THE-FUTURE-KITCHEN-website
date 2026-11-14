import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  MenuItem,
  Order,
  Review,
  GalleryItem,
  RestaurantSettings,
  ContactMessage,
  AdminUser,
} from '../types/restaurant';

export interface DatabaseSchema {
  menuItems: MenuItem[];
  orders: Order[];
  reviews: Review[];
  gallery: GalleryItem[];
  settings: RestaurantSettings;
  contactMessages: ContactMessage[];
  admin: {
    id: string;
    username: string;
    email: string;
    salt: string;
    passwordHash: string;
    sessionTokens: { token: string; createdAt: number; expiresAt: number }[];
  };
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'restaurant_data.json');

// Password hashing helpers
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Default initial seed data
function getInitialSeedData(): DatabaseSchema {
  const initialSalt = crypto.randomBytes(16).toString('hex');
  // Default password: admin123
  const initialPasswordHash = hashPassword('admin123', initialSalt);

  return {
    menuItems: [
      {
        id: 'menu_1',
        name: 'Smokey Party Jollof Rice with Grilled Chicken & Dodo',
        category: 'Nigerian Rice Dishes',
        description: 'Iconic Nigerian long-grain rice infused with fire-roasted peppers, aromatic herbs and authentic firewood smoke. Served with succulent grilled quarter chicken and sweet golden plantains.',
        price: 5500,
        image: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '20-25 mins',
        spiciness: 'Medium',
        tags: ['Bestseller', 'Signature', 'Chef Pick'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_2',
        name: 'Deluxe Special Fried Rice with Jumbo Prawns',
        category: 'Nigerian Rice Dishes',
        description: 'Stir-fried Nigerian rice with garden peas, sweet corn, diced liver, carrots, and sweet bell peppers, crowned with succulent butterflied jumbo tiger prawns.',
        price: 6800,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '20-25 mins',
        spiciness: 'Mild',
        tags: ['Seafood', 'Popular'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_3',
        name: 'Authentic Ofada Rice with Ayamase Designer Stew',
        category: 'Nigerian Rice Dishes',
        description: 'Aromatic unpolished indigenous Ofada rice wrapped in fresh banana leaves, paired with fiery bleached palm oil green pepper stew, assorted bite-sized meats and boiled egg.',
        price: 7500,
        image: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '25-30 mins',
        spiciness: 'Hot',
        tags: ['Traditional', 'Fiery'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_4',
        name: 'Native Village Rice with Dried Fish & Ugba',
        category: 'Nigerian Rice Dishes',
        description: 'Traditional palm oil infused rice cooked with smoked mangala fish, crayfish flakes, shredded ugba (oil bean), and fresh scent leaves.',
        price: 6000,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '20 mins',
        spiciness: 'Medium',
        tags: ['Heritage'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_5',
        name: 'Special Egusi Soup with Assorted Meats & Pounded Yam',
        category: 'Soups and Swallows',
        description: 'Rich hand-rolled melon seed soup simmered with dried stockfish, tender beef tripe (shaki), cowleg, bitterleaf, and fluted pumpkin. Served with pillowy smooth pounded yam.',
        price: 7500,
        image: '/src/assets/images/dish_swallow_egusi_1794331886342.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '20-25 mins',
        spiciness: 'Medium',
        tags: ['Signature', 'Bestseller'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_6',
        name: 'Seafood Okro Soup with Fresh Crab, Prawns & Eba',
        category: 'Soups and Swallows',
        description: 'Velvety chopped fresh okro loaded with fresh Atlantic blue crab, calamari rings, jumbo tiger prawns, and fresh scotch bonnet pepper. Paired with soft yellow Garri Eba.',
        price: 9500,
        image: '/src/assets/images/dish_swallow_egusi_1794331886342.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '25 mins',
        spiciness: 'Medium',
        tags: ['Seafood Special'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_7',
        name: 'Rich Ogbono & Bitterleaf Soup with Goat Meat & Amala',
        category: 'Soups and Swallows',
        description: 'Smooth, deeply flavoured wild mango seed soup cooked with dry cat fish, tender goat meat and shredded bitterleaf, accompanied by soft piping hot Oyo Amala.',
        price: 7000,
        image: '/src/assets/images/dish_swallow_egusi_1794331886342.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '20 mins',
        spiciness: 'Medium',
        tags: ['Traditional'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_8',
        name: 'Calabar Afang Soup with Smoked Fish & Semovita',
        category: 'Soups and Swallows',
        description: 'Classic Efik delight prepared with wild shredded afang leaves, waterleaves, periwinkles in their shells, beef and dried bushmeat. Served with silky smooth Semovita.',
        price: 8000,
        image: '/src/assets/images/dish_swallow_egusi_1794331886342.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '25 mins',
        spiciness: 'Medium',
        tags: ['Calabar Classic'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_9',
        name: 'Flaming Beef Suya Platter with Yaji & Sliced Red Onions',
        category: 'Grilled Foods',
        description: 'Thinly sliced choice beef skewers grilled over glowing hardwood charcoal, dusted generously with authentic Northern Nigerian spiced kuli-kuli Yaji pepper, sliced onions and fresh tomatoes.',
        price: 4800,
        image: '/src/assets/images/dish_grilled_suya_1794331885995.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '15-20 mins',
        spiciness: 'Hot',
        tags: ['Top Rated', 'Street Gourmet'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_10',
        name: 'Charcoal Grilled Whole Croaker Fish with Yam Chips',
        category: 'Grilled Foods',
        description: 'Whole seasoned fresh Atlantic croaker fish, slow-charred over open flame with garlic, ginger and our house pepper marinade. Served with crispy fried yam chips and spicy pepper dip.',
        price: 12500,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '30 mins',
        spiciness: 'Hot',
        tags: ['Chef Signature', 'Platter'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_11',
        name: 'Spicy Asun (Slow-Roasted Peppered Goat Meat)',
        category: 'Grilled Foods',
        description: 'Tender diced goat meat roasted over open fire, tossed in habanero peppers, aromatic thyme, and caramelized sweet onions. Pure Lagos party delight.',
        price: 6500,
        image: '/src/assets/images/dish_grilled_suya_1794331885995.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '15-20 mins',
        spiciness: 'Hot',
        tags: ['Bestseller'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_12',
        name: 'Honey Glazed Peppered Chicken Wings',
        category: 'Grilled Foods',
        description: 'Crispy charcoal grilled jumbo wings tossed in a sweet-spicy reduction of Nigerian wild honey, scotch bonnet peppers, and roasted garlic.',
        price: 4200,
        image: '/src/assets/images/dish_grilled_suya_1794331885995.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '15 mins',
        spiciness: 'Medium',
        tags: ['Bar Favorite'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_13',
        name: 'Gourmet Naija Beef & Cheese Burger with Spiced Fries',
        category: 'Fast Foods',
        description: 'Juicy 200g prime beef patty seasoned with suya spice, melted cheddar cheese, caramelized onions, fresh crisp lettuce, and spicy mayo on a toasted brioche bun with hand-cut fries.',
        price: 5200,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '15 mins',
        spiciness: 'Mild',
        tags: ['Fusion'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_14',
        name: 'Chicken Shawarma Deluxe with Double Sausage',
        category: 'Fast Foods',
        description: 'Thin Lebanese flatbread loaded with shredded spiced chicken breast, twin beef sausages, fresh cabbage, pickled cucumbers, and our signature rich sweet garlic dressing.',
        price: 3500,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '12 mins',
        spiciness: 'Medium',
        tags: ['Quick Bite'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_15',
        name: 'Royal Nigerian Golden Meat Pies (2 Pcs)',
        category: 'Snacks',
        description: 'Flaky golden buttery pastry baked to perfection, stuffed with finely minced beef, diced Irish potatoes, carrots, and rich savory herb gravy.',
        price: 2500,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '5 mins',
        spiciness: 'Mild',
        tags: ['Snack Classic'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_16',
        name: 'Warm Sweet Puff-Puff Basket (10 Pcs)',
        category: 'Snacks',
        description: 'Traditional deep-fried golden yeast dough balls, soft and pillowy on the inside, lightly dusted with organic cinnamon and confectioner sugar.',
        price: 1800,
        image: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '10 mins',
        spiciness: 'None',
        tags: ['Sweet Snack'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_17',
        name: 'Artisanal Hibiscus Zobo Infusion with Cloves & Ginger',
        category: 'Drinks',
        description: 'Slow-brewed dried organic hibiscus calyces infused with fresh pressed ginger juice, cloves, sweet pineapple chunks, and citrus peel. Served chilled over crushed ice.',
        price: 1800,
        image: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '5 mins',
        spiciness: 'None',
        tags: ['Refreshing', 'Organic'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_18',
        name: 'Classic Lagos Chapman Mocktail',
        category: 'Drinks',
        description: 'Nigeria’s signature cocktail created with sparkling Fanta & Sprite, aromatic dash of Angostura bitters, fresh cucumber ribbons, and orange wedges.',
        price: 2500,
        image: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        isAvailable: true,
        isFeatured: true,
        preparationTime: '5 mins',
        spiciness: 'None',
        tags: ['Cocktail'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu_19',
        name: 'Caramelized Plantain Tart with Vanilla Bean Glaze',
        category: 'Desserts',
        description: 'Warm French pastry shell filled with spiced caramelized dodo plantains, spiced rum caramel, and a scoop of velvety vanilla bean ice cream.',
        price: 3800,
        image: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        isAvailable: true,
        isFeatured: false,
        preparationTime: '10 mins',
        spiciness: 'None',
        tags: ['Sweet Finish'],
        createdAt: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: 'ord_1',
        orderNumber: 'TFK-9214-A8',
        customerName: 'Chidinma Adeleke',
        customerPhone: '08034567812',
        customerEmail: 'chidinma.a@gmail.com',
        orderType: 'delivery',
        deliveryAddress: 'Block 4, Flat 12, Admiralty Way, Lekki Phase 1, Lagos',
        specialInstructions: 'Please make the Jollof rice extra smoky. Ring bell upon arrival.',
        items: [
          {
            menuItemId: 'menu_1',
            name: 'Smokey Party Jollof Rice with Grilled Chicken & Dodo',
            price: 5500,
            quantity: 2,
          },
          {
            menuItemId: 'menu_17',
            name: 'Artisanal Hibiscus Zobo Infusion with Cloves & Ginger',
            price: 1800,
            quantity: 2,
          },
        ],
        subtotal: 14600,
        deliveryFee: 1500,
        totalAmount: 16100,
        paymentMethod: 'pay_on_delivery',
        paymentStatus: 'unpaid',
        status: 'Delivered',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24 * 2 + 3600000).toISOString(),
      },
      {
        id: 'ord_2',
        orderNumber: 'TFK-6743-M2',
        customerName: 'Babajide Ogundipe',
        customerPhone: '08129876543',
        customerEmail: 'babajide.o@outlook.com',
        orderType: 'delivery',
        deliveryAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
        specialInstructions: 'Suya should be extra spicy with plenty onions.',
        items: [
          {
            menuItemId: 'menu_9',
            name: 'Flaming Beef Suya Platter with Yaji & Sliced Red Onions',
            price: 4800,
            quantity: 2,
          },
          {
            menuItemId: 'menu_5',
            name: 'Special Egusi Soup with Assorted Meats & Pounded Yam',
            price: 7500,
            quantity: 1,
          },
          {
            menuItemId: 'menu_18',
            name: 'Classic Lagos Chapman Mocktail',
            price: 2500,
            quantity: 2,
          },
        ],
        subtotal: 22100,
        deliveryFee: 1500,
        totalAmount: 23600,
        paymentMethod: 'paystack',
        paymentStatus: 'paid',
        paystackReference: 'pstk_ref_9281746201',
        status: 'Preparing',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
      {
        id: 'ord_3',
        orderNumber: 'TFK-4519-P5',
        customerName: 'Fatima Sanusi',
        customerPhone: '09051234567',
        customerEmail: 'fatima.sanusi@yahoo.com',
        orderType: 'pickup',
        deliveryAddress: 'Pickup in Restaurant',
        specialInstructions: 'Ready by 2:00 PM please.',
        items: [
          {
            menuItemId: 'menu_10',
            name: 'Charcoal Grilled Whole Croaker Fish with Yam Chips',
            price: 12500,
            quantity: 1,
          },
        ],
        subtotal: 12500,
        deliveryFee: 0,
        totalAmount: 12500,
        paymentMethod: 'pay_on_pickup',
        paymentStatus: 'unpaid',
        status: 'Confirmed',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    reviews: [
      {
        id: 'rev_1',
        customerName: 'Dr. Emeka Nwosu',
        rating: 5,
        comment: 'Hands down the best party Jollof rice in Lagos! The smoky firewood aroma was authentic and the grilled chicken was so tender. Ordering online was seamless.',
        dishOrdered: 'Smokey Party Jollof Rice',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      },
      {
        id: 'rev_2',
        customerName: 'Aisha Bello',
        rating: 5,
        comment: 'The Egusi soup with pounded yam reminds me of my grandmother’s kitchen in Enugu. Generous assorted meats, perfectly seasoned. Will definitely be a regular customer!',
        dishOrdered: 'Special Egusi Soup with Pounded Yam',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      },
      {
        id: 'rev_3',
        customerName: 'Tunde Bakare',
        rating: 5,
        comment: 'The beef suya platter with cold Chapman is exceptional. Crisp onions, spicy yaji that hits just right. Quick delivery and beautiful packaging.',
        dishOrdered: 'Flaming Beef Suya Platter',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      },
      {
        id: 'rev_4',
        customerName: 'Folake Adeyemi',
        rating: 4,
        comment: 'Very tasty seafood okro soup! The crab and prawns were fresh. Delivery took 35 minutes during rush hour, but food arrived piping hot.',
        dishOrdered: 'Seafood Okro Soup',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
    gallery: [
      {
        id: 'gal_1',
        title: 'The Grand Nigerian Royal Feast',
        category: 'Nigerian Meals',
        imageUrl: '/src/assets/images/hero_nigerian_feast_1794331884704.jpg',
        description: 'Our signature banquet presentation featuring celebratory Jollof rice, grilled tiger prawns, and spicy goat meat delicacies.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'gal_2',
        title: 'Authentic Firewood Jollof Masterpiece',
        category: 'Nigerian Meals',
        imageUrl: '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg',
        description: 'Smokey long-grain rice carefully slow-cooked with roasted plum tomatoes and scotch bonnets.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'gal_3',
        title: 'Charcoal Suya on Dark Slate',
        category: 'Grilled Dishes',
        imageUrl: '/src/assets/images/dish_grilled_suya_1794331885995.jpg',
        description: 'Tender beef skewers with authentic Northern Nigerian spices and sliced fresh red onions.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'gal_4',
        title: 'Velvety Egusi & Pounded Yam Presentation',
        category: 'Nigerian Meals',
        imageUrl: '/src/assets/images/dish_swallow_egusi_1794331886342.jpg',
        description: 'Artisanal clay bowl presentation of melon seed soup alongside fresh pounded yam.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'gal_5',
        title: 'The Future Kitchen Dining Room',
        category: 'Restaurant Interior',
        imageUrl: '/src/assets/images/restaurant_interior_1794331885410.jpg',
        description: 'Warm brass chandeliers, lush tropical botanicals, and plush forest green velvet seating.',
        createdAt: new Date().toISOString(),
      },
    ],
    settings: {
      name: 'The Future Kitchen',
      tagline: 'FRESH FOOD. AMAZING FLAVOUR. UNFORGETTABLE MOMENTS.',
      welcomeMessage: 'Good Food. Great Moments.',
      shortIntro: 'Where traditional Nigerian culinary heritage meets contemporary fine dining craft. Every dish is cooked with passion, fresh local ingredients, and authentic wood-fire techniques.',
      phone1: '+234 803 456 7890',
      phone2: '+234 812 345 6789',
      email: 'orders@thefuturekitchen.ng',
      whatsapp: '+2348034567890',
      address: '14 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria',
      openingHoursWeekdays: '8:00 AM – 10:30 PM (Monday – Saturday)',
      openingHoursSunday: '12:00 PM – 10:00 PM (Sunday)',
      standardDeliveryFee: 1500,
      freeDeliveryThreshold: 25000,
      currencySymbol: '₦',
      paystack: {
        enabled: true,
        publicKey: 'pk_test_futurekitchen_sample_key',
        secretKey: 'sk_test_futurekitchen_sample_secret',
        testMode: true,
      },
    },
    contactMessages: [],
    admin: {
      id: 'admin_1',
      username: 'admin',
      email: 'admin@thefuturekitchen.ng',
      salt: initialSalt,
      passwordHash: initialPasswordHash,
      sessionTokens: [],
    },
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seed data:', err);
    }

    const initial = getInitialSeedData();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save(): void {
    this.saveDataDirect(this.data);
  }

  // Menu items
  public getMenuItems(): MenuItem[] {
    return this.data.menuItems;
  }

  public getMenuItemById(id: string): MenuItem | undefined {
    return this.data.menuItems.find((item) => item.id === id);
  }

  public addMenuItem(item: Omit<MenuItem, 'id' | 'createdAt'>): MenuItem {
    const newItem: MenuItem = {
      ...item,
      id: `menu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.menuItems.push(newItem);
    this.save();
    return newItem;
  }

  public updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | 'createdAt'>>): MenuItem | null {
    const index = this.data.menuItems.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.data.menuItems[index] = {
      ...this.data.menuItems[index],
      ...updates,
    };
    this.save();
    return this.data.menuItems[index];
  }

  public deleteMenuItem(id: string): boolean {
    const beforeCount = this.data.menuItems.length;
    this.data.menuItems = this.data.menuItems.filter((item) => item.id !== id);
    if (this.data.menuItems.length !== beforeCount) {
      this.save();
      return true;
    }
    return false;
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(
      (order) => order.id === id || order.orderNumber.toUpperCase() === id.toUpperCase()
    );
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public updateOrderStatus(
    id: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ): Order | null {
    const order = this.data.orders.find(
      (o) => o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase()
    );
    if (!order) return null;

    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Reviews
  public getReviews(onlyApproved = false): Review[] {
    const list = onlyApproved
      ? this.data.reviews.filter((r) => r.status === 'approved')
      : this.data.reviews;
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      status: 'approved', // Auto-approved for instant satisfaction, or can be moderated by admin
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.unshift(newReview);
    this.save();
    return newReview;
  }

  public updateReviewStatus(id: string, status: Review['status']): Review | null {
    const review = this.data.reviews.find((r) => r.id === id);
    if (!review) return null;
    review.status = status;
    this.save();
    return review;
  }

  public deleteReview(id: string): boolean {
    const beforeCount = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== beforeCount) {
      this.save();
      return true;
    }
    return false;
  }

  // Gallery
  public getGallery(): GalleryItem[] {
    return this.data.gallery;
  }

  public addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>): GalleryItem {
    const newItem: GalleryItem = {
      ...item,
      id: `gal_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.gallery.push(newItem);
    this.save();
    return newItem;
  }

  public deleteGalleryItem(id: string): boolean {
    const beforeCount = this.data.gallery.length;
    this.data.gallery = this.data.gallery.filter((g) => g.id !== id);
    if (this.data.gallery.length !== beforeCount) {
      this.save();
      return true;
    }
    return false;
  }

  // Settings
  public getSettings(includePrivate = false): RestaurantSettings {
    const settings = { ...this.data.settings };
    if (!includePrivate) {
      // Exclude secret key when serving publicly
      return {
        ...settings,
        paystack: {
          enabled: settings.paystack.enabled,
          publicKey: settings.paystack.publicKey,
          testMode: settings.paystack.testMode,
        },
      };
    }
    return settings;
  }

  public updateSettings(updates: Partial<RestaurantSettings>): RestaurantSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      paystack: {
        ...this.data.settings.paystack,
        ...(updates.paystack || {}),
      },
    };
    this.save();
    return this.data.settings;
  }

  // Contact messages
  public addContactMessage(message: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    this.data.contactMessages.unshift(newMsg);
    this.save();
    return newMsg;
  }

  public getContactMessages(): ContactMessage[] {
    return this.data.contactMessages;
  }

  // Admin authentication
  public verifyAdminCredentials(username: string, password: string): { success: boolean; token?: string; user?: AdminUser } {
    if (this.data.admin.username !== username) {
      return { success: false };
    }

    const calculatedHash = hashPassword(password, this.data.admin.salt);
    if (calculatedHash !== this.data.admin.passwordHash) {
      return { success: false };
    }

    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24 * 7; // 7 days

    this.data.admin.sessionTokens.push({ token, createdAt: now, expiresAt });
    // Clean expired tokens
    this.data.admin.sessionTokens = this.data.admin.sessionTokens.filter((t) => t.expiresAt > now);
    this.save();

    return {
      success: true,
      token,
      user: {
        id: this.data.admin.id,
        username: this.data.admin.username,
        email: this.data.admin.email,
        role: 'superadmin',
      },
    };
  }

  public validateSessionToken(token: string): boolean {
    if (!token) return false;
    const now = Date.now();
    const match = this.data.admin.sessionTokens.find(
      (t) => t.token === token && t.expiresAt > now
    );
    return !!match;
  }

  public revokeSessionToken(token: string): void {
    this.data.admin.sessionTokens = this.data.admin.sessionTokens.filter((t) => t.token !== token);
    this.save();
  }

  public changeAdminPassword(currentPassword: string, newPassword: string): boolean {
    const currentHash = hashPassword(currentPassword, this.data.admin.salt);
    if (currentHash !== this.data.admin.passwordHash) {
      return false;
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);
    this.data.admin.salt = newSalt;
    this.data.admin.passwordHash = newHash;
    this.data.admin.sessionTokens = []; // Log out all sessions
    this.save();
    return true;
  }
}

export const db = new DatabaseManager();
