/**
 * Pure business logic for restaurant ordering calculations, validations and status transitions.
 */

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export interface CartCalculationItem {
  price: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  totalAmount: number;
  itemCount: number;
}

/**
 * Calculates subtotal, delivery fee based on order type & threshold, and final total.
 */
export function calculateOrderTotals(
  items: CartCalculationItem[],
  orderType: 'delivery' | 'pickup',
  standardDeliveryFee: number = 1500,
  freeDeliveryThreshold: number = 25000
): OrderTotals {
  const subtotal = items.reduce((acc, item) => {
    const qty = Math.max(0, Math.floor(item.quantity || 0));
    const prc = Math.max(0, item.price || 0);
    return acc + prc * qty;
  }, 0);

  const itemCount = items.reduce((acc, item) => acc + Math.max(0, Math.floor(item.quantity || 0)), 0);

  if (subtotal === 0 || orderType === 'pickup') {
    return {
      subtotal,
      deliveryFee: 0,
      isFreeDelivery: false,
      totalAmount: subtotal,
      itemCount,
    };
  }

  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : standardDeliveryFee;
  const totalAmount = subtotal + deliveryFee;

  return {
    subtotal,
    deliveryFee,
    isFreeDelivery,
    totalAmount,
    itemCount,
  };
}

/**
 * Formats a number to Nigerian Naira currency format (e.g., ₦4,500)
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0';
  }
  const formatted = new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return `₦${formatted}`;
}

/**
 * Validates Nigerian phone numbers:
 * Supports formats:
 * - 08012345678, 070..., 090..., 081... (11 digits)
 * - +2348012345678, +23490... (international standard with country code)
 * - 2348012345678
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; normalized?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Nigerian 11-digit local format: 070, 080, 081, 090, 091 followed by 8 digits
  const localRegex = /^0(70|80|81|90|91|82|71)\d{8}$/;
  // International format: +234 or 234 followed by 10 digits
  const intlRegex = /^(\+?234)(70|80|81|90|91|82|71)\d{8}$/;

  if (localRegex.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  if (intlRegex.test(cleaned)) {
    const withoutPlus = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
    // Normalize to standard 080... format
    const normalized = '0' + withoutPlus.slice(3);
    return { isValid: true, normalized };
  }

  // Also support general international numbers if valid 10-15 digits
  const genericPhoneRegex = /^\+?[1-9]\d{8,14}$/;
  if (genericPhoneRegex.test(cleaned)) {
    return { isValid: true, normalized: cleaned };
  }

  return { isValid: false, error: 'Please enter a valid phone number (e.g. 0803 123 4567 or +234 803 123 4567)' };
}

/**
 * Validates basic customer email
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Generates an authentic restaurant order number with prefix TFK (The Future Kitchen)
 * e.g. TFK-8241-K9
 */
export function generateOrderNumber(): string {
  const numPart = Math.floor(1000 + Math.random() * 9000);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 2; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TFK-${numPart}-${suffix}`;
}

/**
 * Validates order status transitions according to restaurant workflow
 */
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === 'Delivered' || current === 'Cancelled') {
    // Terminal states cannot be changed except by explicit admin override
    return false;
  }

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Preparing', 'Cancelled'],
    'Preparing': ['Ready for Pickup', 'Out for Delivery', 'Cancelled'],
    'Ready for Pickup': ['Delivered', 'Cancelled'],
    'Out for Delivery': ['Delivered', 'Cancelled'],
    'Delivered': [],
    'Cancelled': [],
  };

  return allowedTransitions[current]?.includes(next) ?? false;
}
