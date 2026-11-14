import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { DishDetailModal } from './components/DishDetailModal';
import { HomeView } from './views/HomeView';
import { MenuView } from './views/MenuView';
import { OrderingView } from './views/OrderingView';
import { GalleryView } from './views/GalleryView';
import { ReviewsView } from './views/ReviewsView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { MenuItem, OrderItem, Review, GalleryItem, RestaurantSettings } from './types/restaurant';
import { api, getStoredAdminToken } from './api/client';
import { formatNaira } from './utils/ordering';

const CART_STORAGE_KEY = 'tfk_cart_items';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedDishModal, setSelectedDishModal] = useState<MenuItem | null>(null);

  // Global loaded data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cart state with local storage persistence
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  // Initial data load from backend
  const loadInitialData = async () => {
    try {
      const [menuData, reviewsData, galleryData, settingsData] = await Promise.all([
        api.getMenu().catch(() => []),
        api.getReviews().catch(() => []),
        api.getGallery().catch(() => []),
        api.getSettings().catch(() => null),
      ]);
      setMenuItems(menuData);
      setReviews(reviewsData);
      setGallery(galleryData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to load initial restaurant data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cart Management
  const handleAddToCart = (dish: MenuItem, quantity = 1, specialNotes?: string) => {
    if (!dish.isAvailable) return;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.menuItemId === dish.id && item.specialNotes === specialNotes
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      } else {
        return [
          ...prev,
          {
            menuItemId: dish.id,
            name: dish.name,
            price: dish.price,
            quantity,
            image: dish.image,
            specialNotes,
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveItem = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isAdminActive = Boolean(getStoredAdminToken());

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1c2621]">
      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        isAdminLoggedIn={isAdminActive}
      />

      {/* Main Content Pages */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomeView
            menuItems={menuItems}
            reviews={reviews}
            settings={settings}
            onSelectDish={(dish) => setSelectedDishModal(dish)}
            onAddToCart={(dish) => handleAddToCart(dish)}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'menu' && (
          <MenuView
            menuItems={menuItems}
            onSelectDish={(dish) => setSelectedDishModal(dish)}
            onAddToCart={(dish) => handleAddToCart(dish)}
          />
        )}

        {activePage === 'ordering' && (
          <OrderingView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigateToMenu={() => {
              setActivePage('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            settings={settings}
          />
        )}

        {activePage === 'gallery' && <GalleryView galleryItems={gallery} />}

        {activePage === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            onReviewSubmitted={(newRev) => setReviews((prev) => [newRev, ...prev])}
          />
        )}

        {activePage === 'about' && (
          <AboutView
            onNavigateToMenu={() => {
              setActivePage('menu');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'contact' && <ContactView settings={settings} />}

        {activePage === 'admin' && (
          <AdminDashboardView onMenuUpdated={loadInitialData} />
        )}
      </main>

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setActivePage('ordering');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        orderType="delivery"
        standardDeliveryFee={settings?.standardDeliveryFee || 1500}
        freeDeliveryThreshold={settings?.freeDeliveryThreshold || 25000}
      />

      {/* Dish Detailed Modal */}
      <DishDetailModal
        dish={selectedDishModal}
        onClose={() => setSelectedDishModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Footer */}
      <Footer setActivePage={setActivePage} />
    </div>
  );
}
