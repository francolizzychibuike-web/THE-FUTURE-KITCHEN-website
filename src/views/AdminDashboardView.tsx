import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Star,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  KeyRound,
  TrendingUp,
  DollarSign,
  PackageCheck,
  Clock,
  Search,
} from 'lucide-react';
import {
  MenuItem,
  Order,
  Review,
  GalleryItem,
  RestaurantSettings,
  DashboardStats,
  AdminUser,
  FoodCategory,
  FOOD_CATEGORIES,
} from '../types/restaurant';
import {
  formatNaira,
  ORDER_STATUSES,
  OrderStatus,
} from '../utils/ordering';
import {
  api,
  getStoredAdminToken,
  setStoredAdminSession,
  clearStoredAdminSession,
  getStoredAdminUser,
} from '../api/client';

interface AdminDashboardViewProps {
  onMenuUpdated: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onMenuUpdated }) => {
  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(getStoredAdminToken());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getStoredAdminUser());
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'reviews' | 'gallery' | 'settings'>('overview');

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  // Loading & Action notifications
  const [loadingData, setLoadingLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [isAddDishModalOpen, setIsAddDishModalOpen] = useState(false);
  const [isAddGalleryModalOpen, setIsAddGalleryModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Password change form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  // Filters for orders & menu
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('All');

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Verify and fetch data when token exists
  useEffect(() => {
    if (authToken) {
      fetchAdminData();
    }
  }, [authToken, activeTab]);

  const fetchAdminData = async () => {
    setLoadingLoading(true);
    try {
      if (activeTab === 'overview') {
        const [statsData, ordersData] = await Promise.all([
          api.getAdminStats(),
          api.getAdminOrders(),
        ]);
        setStats(statsData);
        setOrders(ordersData);
      } else if (activeTab === 'menu') {
        const data = await api.getMenu();
        setMenuItems(data);
      } else if (activeTab === 'orders') {
        const data = await api.getAdminOrders();
        setOrders(data);
      } else if (activeTab === 'reviews') {
        const data = await api.getAdminReviews();
        setReviews(data);
      } else if (activeTab === 'gallery') {
        const data = await api.getGallery();
        setGallery(data);
      } else if (activeTab === 'settings') {
        const data = await api.getAdminSettings();
        setSettings(data);
      }
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes('unauthorized')) {
        handleLogout();
      } else {
        showNotification(err instanceof Error ? err.message : 'Error fetching data', true);
      }
    } finally {
      setLoadingLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await api.adminLogin({
        username: usernameInput.trim(),
        password: passwordInput,
      });

      setStoredAdminSession(res.token, res.user);
      setAuthToken(res.token);
      setCurrentUser(res.user);
      setActiveTab('overview');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch {
      // Ignore
    }
    clearStoredAdminSession();
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, paymentStatus?: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus, paymentStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (viewingOrder?.id === orderId) {
        setViewingOrder(updated);
      }
      showNotification(`Order status updated to ${newStatus}`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to update order status', true);
    }
  };

  // Menu item availability toggle
  const handleToggleDishAvailability = async (dish: MenuItem) => {
    try {
      const updated = await api.updateMenuItem(dish.id, { isAvailable: !dish.isAvailable });
      setMenuItems((prev) => prev.map((item) => (item.id === dish.id ? updated : item)));
      onMenuUpdated();
      showNotification(`"${dish.name}" is now ${updated.isAvailable ? 'In Stock' : 'Sold Out'}`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Could not update dish', true);
    }
  };

  // Delete dish
  const handleDeleteDish = async (dishId: string, dishName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${dishName}" from the menu?`)) {
      return;
    }
    try {
      await api.deleteMenuItem(dishId);
      setMenuItems((prev) => prev.filter((d) => d.id !== dishId));
      onMenuUpdated();
      showNotification(`"${dishName}" deleted successfully`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to delete dish', true);
    }
  };

  // Save edited or new dish
  const handleSaveDish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dishPayload = {
      name: String(formData.get('name') || '').trim(),
      category: String(formData.get('category')) as FoodCategory,
      price: Number(formData.get('price')),
      image: String(formData.get('image') || '').trim(),
      description: String(formData.get('description') || '').trim(),
      spiciness: String(formData.get('spiciness') || 'Medium') as MenuItem['spiciness'],
      preparationTime: String(formData.get('preparationTime') || '20 mins'),
      isAvailable: formData.get('isAvailable') === 'on',
      isFeatured: formData.get('isFeatured') === 'on',
    };

    try {
      if (editingDish) {
        const updated = await api.updateMenuItem(editingDish.id, dishPayload);
        setMenuItems((prev) => prev.map((d) => (d.id === editingDish.id ? updated : d)));
        setEditingDish(null);
        showNotification('Dish updated successfully');
      } else {
        const created = await api.createMenuItem(dishPayload);
        setMenuItems((prev) => [created, ...prev]);
        setIsAddDishModalOpen(false);
        showNotification('New meal added to menu');
      }
      onMenuUpdated();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to save dish', true);
    }
  };

  // Reviews moderation
  const handleReviewAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await api.updateReviewStatus(id, status);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showNotification(`Review marked as ${status}`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to update review', true);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showNotification('Review deleted');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to delete review', true);
    }
  };

  // Gallery actions
  const handleAddGalleryPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const imageUrl = String(formData.get('imageUrl') || '').trim();
    const category = String(formData.get('category') || 'Nigerian Meals') as GalleryItem['category'];
    const description = String(formData.get('description') || '').trim();

    try {
      const created = await api.addGalleryItem({ title, imageUrl, category, description });
      setGallery((prev) => [created, ...prev]);
      setIsAddGalleryModalOpen(false);
      showNotification('New gallery image published');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to add gallery photo', true);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Remove this photo from the gallery?')) return;
    try {
      await api.deleteGalleryItem(id);
      setGallery((prev) => prev.filter((g) => g.id !== id));
      showNotification('Gallery photo removed');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to delete photo', true);
    }
  };

  // Settings update
  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    const formData = new FormData(e.currentTarget);
    const updatedSettingsPayload: Partial<RestaurantSettings> = {
      phone1: String(formData.get('phone1') || '').trim(),
      phone2: String(formData.get('phone2') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      whatsapp: String(formData.get('whatsapp') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      openingHoursWeekdays: String(formData.get('openingHoursWeekdays') || '').trim(),
      openingHoursSunday: String(formData.get('openingHoursSunday') || '').trim(),
      standardDeliveryFee: Number(formData.get('standardDeliveryFee') || 1500),
      freeDeliveryThreshold: Number(formData.get('freeDeliveryThreshold') || 25000),
      paystack: {
        enabled: formData.get('paystackEnabled') === 'on',
        publicKey: String(formData.get('paystackPublicKey') || '').trim(),
        secretKey: String(formData.get('paystackSecretKey') || '').trim(),
        testMode: formData.get('paystackTestMode') === 'on',
      },
    };

    try {
      const res = await api.updateAdminSettings(updatedSettingsPayload);
      setSettings(res);
      showNotification('Restaurant & payment settings updated successfully');
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to update settings', true);
    }
  };

  // Change admin password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    try {
      await api.adminChangePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw('');
      setNewPw('');
      showNotification('Password updated successfully! Please re-login.');
      setTimeout(() => handleLogout(), 1500);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to change password', true);
    }
  };

  // --- RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---
  if (!authToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-2xl p-8 border border-[#2a5e42]/20 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#0e3824] text-[#c59b27] flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0e3824]">
              Staff Administrator Login
            </h1>
            <p className="text-xs text-[#52645a]">
              Secure server-authorized portal for The Future Kitchen management.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="p-3 bg-[#eef5f0] border border-[#2a5e42]/20 rounded-md text-xs text-[#284435] space-y-1">
            <div className="font-bold">Default Demo Admin Credentials:</div>
            <div>Username: <strong className="font-mono">admin</strong></div>
            <div>Password: <strong className="font-mono">admin123</strong></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-[0.99]"
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER LOGGED IN ADMIN DASHBOARD ---
  const filteredOrders = orders.filter((order) => {
    if (orderStatusFilter !== 'All' && order.status !== orderStatusFilter) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchId = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const filteredMenu = menuItems.filter((dish) => {
    if (menuCategoryFilter !== 'All' && dish.category !== menuCategoryFilter) {
      return false;
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return dish.name.toLowerCase().includes(q) || dish.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Bar */}
      <div className="bg-[#0a2316] text-white p-6 rounded-2xl border border-[#1b4330] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              Management Console
            </span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-white/80">User: <strong>{currentUser?.username || 'admin'}</strong></span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-white">
            The Future Kitchen Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminData}
            disabled={loadingData}
            className="px-4 py-2 bg-[#1b4330] hover:bg-[#255c42] text-xs font-semibold rounded-md transition-colors"
          >
            {loadingData ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-900/80 hover:bg-rose-900 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#2a5e42]/15 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'menu', label: `Food Menu (${menuItems.length})`, icon: Utensils },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon },
          { id: 'settings', label: 'Settings & Paystack', icon: SettingsIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-[#0e3824] text-white shadow-sm'
                  : 'bg-white text-[#4d5e53] hover:bg-[#eef5f0] hover:text-[#0e3824] border border-[#2a5e42]/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#596d61] text-xs">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#0e3824]" />
              </div>
              <div className="font-display text-3xl font-extrabold text-[#0e3824] tabular-nums">
                {stats?.totalOrders || orders.length}
              </div>
              <span className="text-[11px] text-slate-400">All recorded lifetime orders</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#596d61] text-xs">
                <span>Pending / Preparing</span>
                <Clock className="w-4 h-4 text-[#c59b27]" />
              </div>
              <div className="font-display text-3xl font-extrabold text-[#c59b27] tabular-nums">
                {stats?.pendingOrders ?? orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
              </div>
              <span className="text-[11px] text-slate-400">Requires kitchen attention</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#596d61] text-xs">
                <span>Completed Orders</span>
                <PackageCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="font-display text-3xl font-extrabold text-emerald-700 tabular-nums">
                {stats?.completedOrders ?? orders.filter((o) => o.status === 'Delivered').length}
              </div>
              <span className="text-[11px] text-slate-400">Successfully delivered</span>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#596d61] text-xs">
                <span>Total Revenue (₦)</span>
                <DollarSign className="w-4 h-4 text-[#0e3824]" />
              </div>
              <div className="font-display text-2xl font-extrabold text-[#0e3824] tabular-nums">
                {formatNaira(stats?.totalRevenue ?? orders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">Valid orders gross</span>
            </div>
          </div>

          {/* Popular Dishes & Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Popular Dishes List (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-4">
              <h3 className="font-display text-lg font-bold text-[#0e3824]">
                Top Selling Nigerian Delicacies
              </h3>
              <div className="space-y-3">
                {stats?.popularDishes && stats.popularDishes.length > 0 ? (
                  stats.popularDishes.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-[#0e3824]">{idx + 1}. {item.name}</span>
                        <span className="text-[11px] text-[#63766b] block">Total sold: {item.orderCount} portions</span>
                      </div>
                      <span className="font-bold text-[#0e3824] tabular-nums">
                        {formatNaira(item.revenue)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No dish order stats yet.</p>
                )}
              </div>
            </div>

            {/* Right: Recent Orders Table (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-[#0e3824]">
                  Recent Kitchen Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#0e3824] hover:text-[#195a3a]"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[#5a6c62]">
                      <th className="py-2.5 font-semibold">Order ID</th>
                      <th className="py-2.5 font-semibold">Customer</th>
                      <th className="py-2.5 font-semibold">Total</th>
                      <th className="py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-[#0e3824]">{ord.orderNumber}</td>
                        <td className="py-3 font-medium text-[#1e2d24]">{ord.customerName}</td>
                        <td className="py-3 font-bold tabular-nums text-[#0e3824]">{formatNaira(ord.totalAmount)}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setViewingOrder(ord);
                              setActiveTab('orders');
                            }}
                            className="text-[#0e3824] font-semibold hover:underline"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-xl border border-[#2a5e42]/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by number, name, phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
              />
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
              {['All', ...ORDER_STATUSES].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#0e3824] text-white'
                      : 'bg-[#faf8f5] text-[#55675c] hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-[#2a5e42]/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] border-b border-[#2a5e42]/15 text-[#3b4c42]">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Order #</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Customer</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Phone</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Type</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Total</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No orders match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#0e3824]">{ord.orderNumber}</td>
                        <td className="py-3 px-4 font-semibold text-[#1e2d24]">{ord.customerName}</td>
                        <td className="py-3 px-4 tabular-nums text-[#4b5d52]">{ord.customerPhone}</td>
                        <td className="py-3 px-4 capitalize">{ord.orderType}</td>
                        <td className="py-3 px-4 font-bold text-[#0e3824] tabular-nums">{formatNaira(ord.totalAmount)}</td>
                        <td className="py-3 px-4">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-xs p-1 rounded border border-[#2a5e42]/20 bg-white font-semibold text-[#0e3824] focus:outline-none"
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="px-2.5 py-1 bg-[#0e3824] text-white text-[11px] font-semibold rounded hover:bg-[#164e33]"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE FOOD MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#2a5e42]/10 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search dishes..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] focus:outline-none"
              />
              <select
                value={menuCategoryFilter}
                onChange={(e) => setMenuCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] focus:outline-none"
              >
                <option value="All">All Categories</option>
                {FOOD_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingDish(null);
                setIsAddDishModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0e3824] hover:bg-[#154e33] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 text-[#c59b27]" />
              <span>Add New Meal</span>
            </button>
          </div>

          {/* Dishes Table */}
          <div className="bg-white rounded-xl border border-[#2a5e42]/10 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#faf8f5] border-b border-[#2a5e42]/15 text-[#3b4c42]">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Dish</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Category</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Price</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px]">Stock Status</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMenu.map((dish) => (
                    <tr key={dish.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-[#0e3824] block">{dish.name}</span>
                            <span className="text-[11px] text-[#63766b] line-clamp-1">{dish.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#43554b]">{dish.category}</td>
                      <td className="py-3 px-4 font-bold text-[#0e3824] tabular-nums">{formatNaira(dish.price)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleDishAvailability(dish)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                            dish.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {dish.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingDish(dish);
                            setIsAddDishModalOpen(true);
                          }}
                          className="p-1.5 text-[#0e3824] hover:bg-slate-100 rounded"
                          aria-label={`Edit ${dish.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(dish.id, dish.name)}
                          className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                          aria-label={`Delete ${dish.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-4">
            <h2 className="font-display text-xl font-bold text-[#0e3824]">
              Customer Reviews Moderation
            </h2>
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-lg border border-[#2a5e42]/15 bg-[#faf8f5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#0e3824]">{rev.customerName}</span>
                      <span className="text-xs text-[#c59b27] font-semibold">
                        {'★'.repeat(rev.rating)} ({rev.rating}/5)
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                    {rev.dishOrdered && (
                      <span className="text-[11px] text-[#55675c] italic block">Dish: {rev.dishOrdered}</span>
                    )}
                    <p className="text-xs text-[#2c3d33]">"{rev.comment}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleReviewAction(rev.id, 'approved')}
                        className="px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-800"
                      >
                        Approve
                      </button>
                    )}
                    {rev.status !== 'rejected' && (
                      <button
                        onClick={() => handleReviewAction(rev.id, 'rejected')}
                        className="px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded hover:bg-amber-800"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 text-rose-700 hover:bg-rose-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: GALLERY MANAGEMENT */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-[#2a5e42]/10 shadow-xs">
            <h2 className="font-display text-xl font-bold text-[#0e3824]">
              Restaurant Gallery Photos ({gallery.length})
            </h2>
            <button
              onClick={() => setIsAddGalleryModalOpen(true)}
              className="px-4 py-2 bg-[#0e3824] hover:bg-[#154e33] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#c59b27]" />
              <span>Add Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-[#2a5e42]/10 overflow-hidden shadow-xs">
                <div className="aspect-4/3 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                      aria-label="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c59b27]">{item.category}</span>
                  <h4 className="font-bold text-sm text-[#0e3824] truncate">{item.title}</h4>
                  <p className="text-xs text-[#52645a] line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RESTAURANT & PAYSTACK SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
          {/* Settings form (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0e3824]">
                Restaurant Information & Delivery Configuration
              </h2>
              <p className="text-xs text-[#52645a]">
                Update telephone numbers, address, delivery fees, and Paystack payment gateway parameters.
              </p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Orders Phone Line
                  </label>
                  <input
                    type="text"
                    name="phone1"
                    defaultValue={settings?.phone1}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Support Phone Line
                  </label>
                  <input
                    type="text"
                    name="phone2"
                    defaultValue={settings?.phone2}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Restaurant Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={settings?.email}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    defaultValue={settings?.whatsapp}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Physical Address in Lagos
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={settings?.address}
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Weekday Hours (Mon-Sat)
                  </label>
                  <input
                    type="text"
                    name="openingHoursWeekdays"
                    defaultValue={settings?.openingHoursWeekdays}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Sunday Hours
                  </label>
                  <input
                    type="text"
                    name="openingHoursSunday"
                    defaultValue={settings?.openingHoursSunday}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Standard Delivery Fee (₦)
                  </label>
                  <input
                    type="number"
                    name="standardDeliveryFee"
                    defaultValue={settings?.standardDeliveryFee}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Free Delivery Threshold (₦)
                  </label>
                  <input
                    type="number"
                    name="freeDeliveryThreshold"
                    defaultValue={settings?.freeDeliveryThreshold}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              {/* Paystack Payment Settings Section */}
              <div className="p-4 bg-[#eef5f0] rounded-xl border border-[#2a5e42]/20 space-y-3 pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[#0e3824]">
                    Paystack Payment Gateway Configuration
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0e3824]">
                    <input
                      type="checkbox"
                      name="paystackEnabled"
                      defaultChecked={settings?.paystack?.enabled}
                      className="rounded text-[#0e3824] focus:ring-[#0e3824]"
                    />
                    <span>Enable Online Payments</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#0e3824] uppercase">
                      Paystack Public Key
                    </label>
                    <input
                      type="text"
                      name="paystackPublicKey"
                      defaultValue={settings?.paystack?.publicKey}
                      className="w-full px-3 py-2 text-xs font-mono rounded border border-slate-300 bg-white"
                      placeholder="pk_test_..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#0e3824] uppercase">
                      Paystack Secret Key (Server-side Only)
                    </label>
                    <input
                      type="password"
                      name="paystackSecretKey"
                      defaultValue={settings?.paystack?.secretKey}
                      className="w-full px-3 py-2 text-xs font-mono rounded border border-slate-300 bg-white"
                      placeholder="sk_test_..."
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#3b4e43]">
                    <input
                      type="checkbox"
                      name="paystackTestMode"
                      defaultChecked={settings?.paystack?.testMode}
                      className="rounded text-[#0e3824]"
                    />
                    <span>Test Mode Active (Simulate real Paystack transactions without live bank debit)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm"
              >
                Save Settings
              </button>
            </form>
          </div>

          {/* Change Admin Password Card (4 cols) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#c59b27]" />
              <h3 className="font-display text-lg font-bold text-[#0e3824]">
                Change Admin Password
              </h3>
            </div>
            <p className="text-xs text-[#52645a]">
              Protect administrative operations by updating your password.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DISH */}
      {isAddDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-5 border border-[#2a5e42]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl font-bold text-[#0e3824]">
              {editingDish ? `Edit Meal: ${editingDish.name}` : 'Add New Nigerian Meal'}
            </h3>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Dish Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingDish?.name}
                  placeholder="e.g. Special Egusi Soup with Pounded Yam"
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824]">Category *</label>
                  <select
                    name="category"
                    defaultValue={editingDish?.category || 'Nigerian Rice Dishes'}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  >
                    {FOOD_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824]">Price (₦) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={100}
                    defaultValue={editingDish?.price || 4500}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Image URL / Path</label>
                <input
                  type="text"
                  name="image"
                  defaultValue={editingDish?.image || '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg'}
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingDish?.description}
                  className="w-full p-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824]">Spice Level</label>
                  <select
                    name="spiciness"
                    defaultValue={editingDish?.spiciness || 'Medium'}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  >
                    <option value="None">None</option>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#0e3824]">Prep Time</label>
                  <input
                    type="text"
                    name="preparationTime"
                    defaultValue={editingDish?.preparationTime || '20 mins'}
                    className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    defaultChecked={editingDish ? editingDish.isAvailable : true}
                    className="rounded text-[#0e3824]"
                  />
                  <span>Available in Stock</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={editingDish?.isFeatured}
                    className="rounded text-[#0e3824]"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddDishModalOpen(false);
                    setEditingDish(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0e3824] hover:bg-[#154e33] text-white text-xs font-semibold uppercase tracking-wider rounded"
                >
                  {editingDish ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD GALLERY PHOTO */}
      {isAddGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#2a5e42]/20 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-[#0e3824]">
              Publish New Gallery Photo
            </h3>

            <form onSubmit={handleAddGalleryPhoto} className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Sizzling Charcoal Suya Platter"
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Category</label>
                <select
                  name="category"
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                >
                  <option value="Nigerian Meals">Nigerian Meals</option>
                  <option value="Restaurant Interior">Restaurant Interior</option>
                  <option value="Food Preparation">Food Preparation</option>
                  <option value="Grilled Dishes">Grilled Dishes</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Special Presentations">Special Presentations</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Image URL / Path *</label>
                <input
                  type="text"
                  name="imageUrl"
                  required
                  defaultValue="/src/assets/images/dish_grilled_suya_1794331885995.jpg"
                  className="w-full px-3 py-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0e3824]">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full p-2 text-xs rounded border border-[#2a5e42]/20 bg-[#faf8f5]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddGalleryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0e3824] text-white text-xs font-semibold uppercase tracking-wider rounded"
                >
                  Upload & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW ORDER FULL DETAILS */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 border border-[#2a5e42]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">ORDER DETAILS</span>
                <h3 className="font-mono text-xl font-bold text-[#0e3824]">
                  {viewingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-[#faf8f5] p-4 rounded-lg">
              <div><strong>Customer Name:</strong> {viewingOrder.customerName}</div>
              <div><strong>Phone Number:</strong> {viewingOrder.customerPhone}</div>
              {viewingOrder.customerEmail && (
                <div><strong>Email:</strong> {viewingOrder.customerEmail}</div>
              )}
              <div><strong>Delivery Type:</strong> {viewingOrder.orderType.toUpperCase()}</div>
              <div><strong>Delivery Address:</strong> {viewingOrder.deliveryAddress}</div>
              {viewingOrder.specialInstructions && (
                <div><strong>Instructions:</strong> {viewingOrder.specialInstructions}</div>
              )}
              <div><strong>Payment:</strong> {viewingOrder.paymentMethod} ({viewingOrder.paymentStatus})</div>
              {viewingOrder.paystackReference && (
                <div><strong>Paystack Ref:</strong> {viewingOrder.paystackReference}</div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0e3824]">
                Items Ordered:
              </span>
              <div className="divide-y divide-slate-100 text-xs">
                {viewingOrder.items.map((item, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <div>
                      <span>{item.quantity}x {item.name}</span>
                      {item.specialNotes && (
                        <span className="block text-[11px] text-slate-500 italic">Note: {item.specialNotes}</span>
                      )}
                    </div>
                    <span className="tabular-nums font-bold text-[#0e3824]">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#0e3824]">
              <span>Total Amount:</span>
              <span className="tabular-nums text-base">{formatNaira(viewingOrder.totalAmount)}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs">
                <span className="block text-slate-400">Change Status:</span>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(viewingOrder.id, e.target.value)}
                  className="mt-1 p-1 text-xs border border-slate-300 rounded font-semibold text-[#0e3824]"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 bg-[#0e3824] text-white text-xs font-semibold rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
