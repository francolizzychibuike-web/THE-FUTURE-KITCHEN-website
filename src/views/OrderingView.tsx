import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  Search,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderItem, RestaurantSettings } from '../types/restaurant';
import {
  formatNaira,
  calculateOrderTotals,
  validatePhoneNumber,
  ORDER_STATUSES,
  OrderStatus,
} from '../utils/ordering';
import { api } from '../api/client';

interface OrderingViewProps {
  cartItems: OrderItem[];
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onClearCart: () => void;
  onNavigateToMenu: () => void;
  settings: RestaurantSettings | null;
}

export const OrderingView: React.FC<OrderingViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToMenu,
  settings,
}) => {
  // Navigation tabs: Checkout vs Track Order
  const [activeTab, setActiveTab] = useState<'checkout' | 'track'>('checkout');

  // Checkout Form State
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_on_delivery' | 'pay_on_pickup' | 'paystack'>('pay_on_delivery');

  // Submission / Loading / Error
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Paystack verification state
  const [verifyingPaystack, setVerifyingPaystack] = useState(false);
  const [paystackSuccess, setPaystackSuccess] = useState(false);

  // Tracking State
  const [trackingSearchInput, setTrackingSearchInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const standardFee = settings?.standardDeliveryFee || 1500;
  const freeThreshold = settings?.freeDeliveryThreshold || 25000;
  const totals = calculateOrderTotals(cartItems, orderType, standardFee, freeThreshold);

  // Handle Order Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items from our menu.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const phoneValidation = validatePhoneNumber(customerPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.error || 'Please enter a valid Nigerian phone number.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please enter your delivery address in Lagos.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: phoneValidation.normalized || customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : 'Pickup in Restaurant',
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod,
        items: cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialNotes: item.specialNotes,
        })),
      };

      const order = await api.submitOrder(payload);
      setCompletedOrder(order);
      onClearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit order. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Paystack payment simulation/verification
  const handlePaystackPayment = async () => {
    if (!completedOrder) return;
    setVerifyingPaystack(true);
    try {
      const demoRef = `pstk_ref_${Date.now()}`;
      const res = await api.verifyPaystackPayment(completedOrder.id, demoRef);
      if (res.order) {
        setCompletedOrder(res.order);
      }
      setPaystackSuccess(true);
    } catch (err) {
      alert('Payment verification could not be completed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setVerifyingPaystack(false);
    }
  };

  // Handle Tracking Search
  const handleTrackOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackingSearchInput.trim()) return;

    setTrackingLoading(true);
    setTrackingError(null);
    setTrackedOrder(null);

    try {
      const order = await api.getOrder(trackingSearchInput.trim());
      setTrackedOrder(order);
    } catch (err) {
      setTrackingError(err instanceof Error ? err.message : 'Order not found. Please double-check your Order Number.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Status index helper
  const getStatusIndex = (status: OrderStatus) => {
    const sequence: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Preparing',
      orderType === 'pickup' ? 'Ready for Pickup' : 'Out for Delivery',
      'Delivered',
    ];
    return sequence.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header and Mode switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#2a5e42]/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
            Online Kitchen Orders
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0e3824] mt-1">
            Food Ordering & Tracking
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#2a5e42]/20 shadow-xs">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'checkout'
                ? 'bg-[#0e3824] text-white shadow-xs'
                : 'text-[#4b5c52] hover:text-[#0e3824]'
            }`}
          >
            {completedOrder ? 'Order Confirmed' : 'Place Order'}
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'track'
                ? 'bg-[#0e3824] text-white shadow-xs'
                : 'text-[#4b5c52] hover:text-[#0e3824]'
            }`}
          >
            Track Order Status
          </button>
        </div>
      </div>

      {/* VIEW 1: SUCCESSFUL ORDER CONFIRMATION SCREEN */}
      {completedOrder && activeTab === 'checkout' && (
        <div className="bg-white rounded-2xl border border-[#2a5e42]/20 shadow-lg p-6 sm:p-10 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c59b27]">
              Order Placed Successfully
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824]">
              Thank You, {completedOrder.customerName}!
            </h2>
            <p className="text-sm text-[#4d5f54] max-w-md mx-auto">
              Your order has been received by our kitchen and assigned order number:
            </p>
            <div className="inline-block px-5 py-2.5 bg-[#faf8f5] border-2 border-dashed border-[#0e3824]/40 rounded-lg font-mono text-xl font-bold text-[#0e3824] tracking-wider">
              {completedOrder.orderNumber}
            </div>
          </div>

          {/* Real-time Order Status Progress Stepper */}
          <div className="bg-[#faf8f5] p-6 rounded-xl border border-[#2a5e42]/10 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#0e3824] uppercase tracking-wider">Current Kitchen Status:</span>
              <span className="font-bold text-[#0e3824] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                {completedOrder.status}
              </span>
            </div>

            {/* Stepper bar */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { title: 'Pending', step: 1 },
                { title: 'Confirmed', step: 2 },
                { title: 'Preparing', step: 3 },
                { title: completedOrder.orderType === 'pickup' ? 'Ready' : 'Delivered', step: 4 },
              ].map((s, idx) => {
                const currentIdx = getStatusIndex(completedOrder.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={s.title} className="text-center">
                    <div
                      className={`h-2 rounded-full mb-2 transition-all ${
                        isPassed ? 'bg-[#0e3824]' : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`text-[11px] block truncate ${
                        isCurrent
                          ? 'font-bold text-[#0e3824]'
                          : isPassed
                          ? 'text-[#2e4739] font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paystack Payment Section if Paystack chosen and unpaid */}
          {completedOrder.paymentMethod === 'paystack' && (
            <div className="p-5 rounded-xl border border-[#c59b27]/30 bg-[#fdfbf6] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#c59b27]" />
                  <span className="text-sm font-bold text-[#0e3824]">Paystack Online Gateway</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#c59b27]">
                  {completedOrder.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Awaiting'}
                </span>
              </div>

              {completedOrder.paymentStatus === 'paid' ? (
                <div className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-md flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Payment verified securely. Reference: <strong>{completedOrder.paystackReference || 'Verified'}</strong></span>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#526359] leading-relaxed">
                    Amount Due: <strong>{formatNaira(completedOrder.totalAmount)}</strong>. Click below to verify and complete your Paystack payment securely.
                  </p>
                  <button
                    onClick={handlePaystackPayment}
                    disabled={verifyingPaystack}
                    className="w-full py-3 bg-[#0ba4db] hover:bg-[#078dbd] text-white font-bold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {verifyingPaystack ? (
                      <span>Verifying with Paystack...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Complete Paystack Payment ({formatNaira(completedOrder.totalAmount)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Itemized Order Summary */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0e3824]">
              Ordered Food Items:
            </h4>
            <div className="space-y-2">
              {completedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <span className="font-semibold text-[#0e3824]">{item.quantity}x {item.name}</span>
                    {item.specialNotes && (
                      <span className="block text-[11px] text-[#6a7d72] italic">Note: {item.specialNotes}</span>
                    )}
                  </div>
                  <span className="tabular-nums font-bold text-[#0e3824]">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-xs space-y-1 text-[#485b50]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold">{formatNaira(completedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="tabular-nums font-semibold">
                  {completedOrder.deliveryFee === 0 ? 'FREE' : formatNaira(completedOrder.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#0e3824] pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="tabular-nums text-base">{formatNaira(completedOrder.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer details */}
          <div className="bg-[#faf8f5] p-4 rounded-lg text-xs space-y-1.5 text-[#4a5c51]">
            <div><strong>Recipient:</strong> {completedOrder.customerName} ({completedOrder.customerPhone})</div>
            <div><strong>Order Type:</strong> {completedOrder.orderType === 'delivery' ? 'Home / Office Delivery' : 'Restaurant Pickup'}</div>
            <div><strong>Address:</strong> {completedOrder.deliveryAddress}</div>
            {completedOrder.specialInstructions && (
              <div><strong>Instructions:</strong> {completedOrder.specialInstructions}</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setCompletedOrder(null);
                onNavigateToMenu();
              }}
              className="flex-1 py-3 bg-[#0e3824] hover:bg-[#164e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md text-center transition-colors shadow-sm"
            >
              Order More Dishes
            </button>
            <button
              onClick={() => {
                setTrackingSearchInput(completedOrder.orderNumber);
                setActiveTab('track');
                handleTrackOrder();
              }}
              className="flex-1 py-3 bg-white border border-[#2a5e42]/20 hover:bg-[#0e3824]/5 text-[#0e3824] font-semibold text-xs uppercase tracking-wider rounded-md text-center transition-colors"
            >
              Live Tracking Page
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: CHECKOUT ORDER FORM */}
      {!completedOrder && activeTab === 'checkout' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0e3824]">
                Customer & Delivery Information
              </h2>
              <p className="text-xs text-[#52645a] mt-1">
                Please provide your contact and delivery location in Lagos so our kitchen can prepare and dispatch your meal.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Delivery vs Pickup Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Select Order Fulfilment:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      orderType === 'delivery'
                        ? 'border-[#0e3824] bg-[#eef5f0] text-[#0e3824] font-semibold'
                        : 'border-slate-200 bg-[#faf8f5] text-[#52645a] hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#c59b27]" />
                    <div>
                      <div className="text-xs font-bold">Delivery to Address</div>
                      <div className="text-[11px] opacity-80">Insulated thermal dispatch</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                      orderType === 'pickup'
                        ? 'border-[#0e3824] bg-[#eef5f0] text-[#0e3824] font-semibold'
                        : 'border-slate-200 bg-[#faf8f5] text-[#52645a] hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-[#c59b27]" />
                    <div>
                      <div className="text-xs font-bold">Self-Pickup in VI</div>
                      <div className="text-[11px] opacity-80">Ready at restaurant desk</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Customer Full Name */}
              <div className="space-y-1">
                <label htmlFor="customer-name" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Babajide Adeleke"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                  />
                </div>
              </div>

              {/* Phone & Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="customer-phone" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Phone Number (WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0803 123 4567 or +234..."
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="customer-email" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Email Address (Optional)
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. jide@example.com"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                  />
                </div>
              </div>

              {/* Delivery Address (only for delivery) */}
              {orderType === 'delivery' && (
                <div className="space-y-1">
                  <label htmlFor="delivery-address" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                    Delivery Street Address in Lagos *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      id="delivery-address"
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="e.g. Flat 3B, Plot 14 Admiralty Way, Lekki Phase 1, Lagos"
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                    />
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-1">
                <label htmlFor="order-instructions" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Special Kitchen / Delivery Instructions
                </label>
                <textarea
                  id="order-instructions"
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Extra spicy, don't ring doorbell, call upon arrival..."
                  className="w-full p-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                  maxLength={300}
                />
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Payment Method:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#2a5e42]/15 bg-[#faf8f5] cursor-pointer hover:bg-[#eef5f0] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={orderType === 'delivery' ? 'pay_on_delivery' : 'pay_on_pickup'}
                      checked={paymentMethod === 'pay_on_delivery' || paymentMethod === 'pay_on_pickup'}
                      onChange={() =>
                        setPaymentMethod(orderType === 'delivery' ? 'pay_on_delivery' : 'pay_on_pickup')
                      }
                      className="text-[#0e3824] focus:ring-[#0e3824]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#0e3824]">
                        {orderType === 'delivery' ? 'Pay on Delivery (Cash or POS Transfer)' : 'Pay at Counter on Pickup'}
                      </span>
                      <span className="block text-[11px] text-[#55675c]">
                        Inspect your order first, then pay our rider or counter cashier.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#2a5e42]/15 bg-[#faf8f5] cursor-pointer hover:bg-[#eef5f0] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                      className="text-[#0e3824] focus:ring-[#0e3824]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[#0e3824] flex items-center gap-2">
                        <span>Paystack Online Payment</span>
                        <span className="text-[10px] bg-[#0ba4db] text-white px-1.5 py-0.2 rounded font-semibold">
                          Cards / USSD / Bank
                        </span>
                      </span>
                      <span className="block text-[11px] text-[#55675c]">
                        Secure immediate debit with Nigerian Mastercard, Visa, Verve or USSD.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || cartItems.length === 0}
                className={`w-full py-3.5 px-6 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${
                  submitting || cartItems.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0e3824] hover:bg-[#164e33] active:scale-[0.99] text-white'
                }`}
              >
                {submitting ? (
                  <span>Submitting your order...</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                    <span>Submit & Place Order ({formatNaira(totals.totalAmount)})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Cart Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-display text-lg font-bold text-[#0e3824]">
                Order Summary ({totals.itemCount} items)
              </h3>
              <button
                type="button"
                onClick={onNavigateToMenu}
                className="text-xs font-semibold text-[#0e3824] hover:text-[#185337]"
              >
                + Add Dishes
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-[#5c6e64]">Your order basket is currently empty.</p>
                <button
                  onClick={onNavigateToMenu}
                  className="px-4 py-2 bg-[#0e3824] text-white text-xs font-semibold uppercase tracking-wider rounded-md"
                >
                  Explore Food Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0e3824] truncate">{item.name}</div>
                        <div className="text-[11px] text-[#c59b27] font-semibold tabular-nums">
                          {formatNaira(item.price)} each
                        </div>
                        {item.specialNotes && (
                          <div className="text-[10px] text-slate-500 italic truncate">
                            Note: {item.specialNotes}
                          </div>
                        )}
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center border border-slate-200 rounded bg-[#faf8f5]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                          className="p-1 hover:bg-slate-200 text-[#0e3824]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold tabular-nums text-[#0e3824]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                          className="p-1 hover:bg-slate-200 text-[#0e3824]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#0e3824] tabular-nums block">
                          {formatNaira(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.menuItemId)}
                          className="text-[#a13b3b] hover:text-red-700 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="pt-3 space-y-2 text-xs text-[#4b5e52]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#0e3824] tabular-nums">
                      {formatNaira(totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery ({orderType === 'delivery' ? 'Dispatch' : 'Pickup'})</span>
                    <span className="tabular-nums font-semibold">
                      {totals.deliveryFee === 0 ? (
                        <span className="text-emerald-700">FREE</span>
                      ) : (
                        formatNaira(totals.deliveryFee)
                      )}
                    </span>
                  </div>

                  {orderType === 'delivery' && !totals.isFreeDelivery && (
                    <div className="text-[11px] text-[#2f4b3a] bg-[#eef5f0] p-2 rounded">
                      Add <strong>{formatNaira(freeThreshold - totals.subtotal)}</strong> more to get Free Delivery!
                    </div>
                  )}

                  <div className="flex justify-between text-base font-bold text-[#0e3824] pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span className="tabular-nums text-lg text-[#0e3824]">
                      {formatNaira(totals.totalAmount)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: ORDER TRACKING TAB */}
      {activeTab === 'track' && (
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Tracking Search Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs space-y-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0e3824]">
              Track Your Food Order
            </h2>
            <p className="text-xs sm:text-sm text-[#4d5f54]">
              Enter the unique Order Number from your confirmation (e.g. <strong>TFK-9214-A8</strong> or <strong>TFK-6743-M2</strong>) to check live status.
            </p>

            <form onSubmit={handleTrackOrder} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. TFK-9214-A8"
                  value={trackingSearchInput}
                  onChange={(e) => setTrackingSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] uppercase font-mono text-[#1a2920] placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-2.5 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shrink-0"
              >
                {trackingLoading ? 'Searching...' : 'Track'}
              </button>
            </form>

            {trackingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{trackingError}</span>
              </div>
            )}
          </div>

          {/* Tracked Order Details Card */}
          {trackedOrder && (
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block">ORDER ID</span>
                  <h3 className="font-mono text-xl font-bold text-[#0e3824]">
                    {trackedOrder.orderNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold uppercase tracking-wider">
                    {trackedOrder.status}
                  </span>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                  Live Preparation Pipeline:
                </span>
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[
                    { label: 'Pending' },
                    { label: 'Confirmed' },
                    { label: 'Preparing' },
                    { label: trackedOrder.orderType === 'pickup' ? 'Ready' : 'Out for Delivery' },
                  ].map((step, idx) => {
                    const currentIdx = getStatusIndex(trackedOrder.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step.label} className="text-center">
                        <div
                          className={`h-2 rounded-full mb-1.5 transition-all ${
                            isPassed ? 'bg-[#0e3824]' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[11px] block truncate ${
                            isCurrent
                              ? 'font-bold text-[#0e3824]'
                              : isPassed
                              ? 'text-[#2b4436] font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#faf8f5] p-4 rounded-lg">
                <div>
                  <span className="text-slate-400 block">Customer Name</span>
                  <span className="font-semibold text-[#0e3824]">{trackedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone Contact</span>
                  <span className="font-semibold text-[#0e3824] tabular-nums">{trackedOrder.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Order Placed</span>
                  <span className="text-[#3b4b42]">
                    {new Date(trackedOrder.createdAt).toLocaleDateString()} at{' '}
                    {new Date(trackedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destination</span>
                  <span className="text-[#3b4b42] truncate block">{trackedOrder.deliveryAddress}</span>
                </div>
              </div>

              {/* Itemized summary */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-[#0e3824] uppercase tracking-wider block">
                  Items in this order:
                </span>
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50">
                    <span className="text-[#2b3a32]">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-[#0e3824] tabular-nums">
                      {formatNaira(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-[#0e3824] pt-2">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-base">{formatNaira(trackedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
