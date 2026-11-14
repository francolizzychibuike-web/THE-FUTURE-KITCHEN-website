/**
 * Shared types for The Future Kitchen restaurant application
 */
import { OrderStatus } from '../utils/ordering';

export type FoodCategory =
  | 'Nigerian Rice Dishes'
  | 'Soups and Swallows'
  | 'Grilled Foods'
  | 'Fast Foods'
  | 'Snacks'
  | 'Drinks'
  | 'Desserts';

export const FOOD_CATEGORIES: FoodCategory[] = [
  'Nigerian Rice Dishes',
  'Soups and Swallows',
  'Grilled Foods',
  'Fast Foods',
  'Snacks',
  'Drinks',
  'Desserts',
];

export interface MenuItem {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  preparationTime?: string;
  spiciness?: 'Mild' | 'Medium' | 'Hot' | 'None';
  tags?: string[];
  createdAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  specialNotes?: string;
}

export type PaymentMethod = 'pay_on_delivery' | 'pay_on_pickup' | 'paystack';
export type PaymentStatus = 'unpaid' | 'paid' | 'pending_verification' | 'failed';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderType: 'delivery' | 'pickup';
  deliveryAddress: string;
  specialInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paystackReference?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  dishOrdered?: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | 'Nigerian Meals'
    | 'Restaurant Interior'
    | 'Food Preparation'
    | 'Grilled Dishes'
    | 'Drinks'
    | 'Special Presentations';
  imageUrl: string;
  description: string;
  createdAt: string;
}

export interface PaystackSettings {
  enabled: boolean;
  publicKey: string;
  secretKey?: string; // Private, omitted in public settings API
  testMode: boolean;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  welcomeMessage: string;
  shortIntro: string;
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;
  address: string;
  openingHoursWeekdays: string;
  openingHoursSunday: string;
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  currencySymbol: string;
  paystack: PaystackSettings;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'manager';
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todaysOrders: number;
  todaysRevenue: number;
  averageRating: number;
  totalReviews: number;
  popularDishes: { name: string; category: string; orderCount: number; revenue: number }[];
  recentOrders: Order[];
}
