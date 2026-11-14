/**
 * Frontend API client communicating with Express backend endpoints
 */
import {
  MenuItem,
  Order,
  Review,
  GalleryItem,
  RestaurantSettings,
  DashboardStats,
  AdminUser,
} from '../types/restaurant';

const ADMIN_TOKEN_KEY = 'tfk_admin_token';
const ADMIN_USER_KEY = 'tfk_admin_user';

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminSession(token: string, user: AdminUser): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearStoredAdminSession(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  const data = localStorage.getItem(ADMIN_USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredAdminToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = typeof data === 'object' && data?.error ? data.error : `Request failed: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Public Menu
  getMenu: () => apiRequest<MenuItem[]>('/api/menu'),
  getMenuItem: (id: string) => apiRequest<MenuItem>(`/api/menu/${id}`),

  // Public Settings
  getSettings: () => apiRequest<RestaurantSettings>('/api/settings'),

  // Public Orders
  submitOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderType: 'delivery' | 'pickup';
    deliveryAddress: string;
    specialInstructions?: string;
    paymentMethod: string;
    items: { menuItemId: string; quantity: number; specialNotes?: string }[];
  }) =>
    apiRequest<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getOrder: (idOrNumber: string) => apiRequest<Order>(`/api/orders/${encodeURIComponent(idOrNumber)}`),

  verifyPaystackPayment: (orderId: string, reference: string) =>
    apiRequest<{ success: boolean; message: string; order: Order }>(`/api/orders/${orderId}/verify-paystack`, {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }),

  // Reviews
  getReviews: () => apiRequest<Review[]>('/api/reviews'),
  submitReview: (reviewData: {
    customerName: string;
    rating: number;
    comment: string;
    dishOrdered?: string;
  }) =>
    apiRequest<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  // Gallery
  getGallery: () => apiRequest<GalleryItem[]>('/api/gallery'),

  // Contact
  submitContact: (contactData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) =>
    apiRequest<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    }),

  // Admin Auth
  adminLogin: (credentials: { username: string; password: string }) =>
    apiRequest<{ success: boolean; token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  adminCheckAuth: () => apiRequest<{ authenticated: boolean; user: AdminUser }>('/api/admin/me'),

  adminLogout: () =>
    apiRequest<{ success: boolean }>('/api/admin/logout', {
      method: 'POST',
    }),

  adminChangePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    apiRequest<{ success: boolean; message: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  // Admin Dashboard
  getAdminStats: () => apiRequest<DashboardStats>('/api/admin/stats'),
  getAdminOrders: () => apiRequest<Order[]>('/api/admin/orders'),
  updateOrderStatus: (id: string, status: string, paymentStatus?: string) =>
    apiRequest<Order>(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentStatus }),
    }),

  // Admin Menu Management
  createMenuItem: (item: Partial<MenuItem>) =>
    apiRequest<MenuItem>('/api/admin/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    }),

  updateMenuItem: (id: string, updates: Partial<MenuItem>) =>
    apiRequest<MenuItem>(`/api/admin/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteMenuItem: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/api/admin/menu/${id}`, {
      method: 'DELETE',
    }),

  // Admin Reviews Moderation
  getAdminReviews: () => apiRequest<Review[]>('/api/admin/reviews'),
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'rejected') =>
    apiRequest<Review>(`/api/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteReview: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    }),

  // Admin Gallery Management
  addGalleryItem: (item: Partial<GalleryItem>) =>
    apiRequest<GalleryItem>('/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  deleteGalleryItem: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
    }),

  // Admin Settings
  getAdminSettings: () => apiRequest<RestaurantSettings>('/api/admin/settings'),
  updateAdminSettings: (settings: Partial<RestaurantSettings>) =>
    apiRequest<RestaurantSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
