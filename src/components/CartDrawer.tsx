import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { OrderItem } from '../types/restaurant';
import { formatNaira, calculateOrderTotals } from '../utils/ordering';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (menuItemId: string, delta: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onProceedToCheckout: () => void;
  orderType: 'delivery' | 'pickup';
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  orderType,
  standardDeliveryFee,
  freeDeliveryThreshold,
}) => {
  if (!isOpen) return null;

  const totals = calculateOrderTotals(items, orderType, standardDeliveryFee, freeDeliveryThreshold);
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - totals.subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((totals.subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] shadow-2xl flex flex-col border-l border-[#2a5e42]/20 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-[#2a5e42]/15 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0e3824]" />
              <h2 id="cart-title" className="font-display text-xl font-bold text-[#0e3824]">
                Your Feast ({totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'})
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-1.5 text-[#52645a] hover:text-[#0e3824] hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery tracker for delivery orders */}
          {orderType === 'delivery' && (
            <div className="px-5 py-3 bg-[#eef5f0] border-b border-[#2a5e42]/10 text-xs">
              {totals.isFreeDelivery ? (
                <div className="font-semibold text-[#0e3824] flex items-center gap-1.5">
                  <span>🎉</span>
                  <span>You've unlocked <strong>FREE Delivery</strong> across Lagos!</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-[#2e4738] mb-1.5">
                    <span>Add <strong>{formatNaira(remainingForFreeDelivery)}</strong> more for FREE delivery</span>
                    <span className="font-semibold">{freeDeliveryPercent}%</span>
                  </div>
                  <div className="w-full bg-[#d0e2d5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0e3824] h-full rounded-full transition-all duration-300"
                      style={{ width: `${freeDeliveryPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#eef5f0] flex items-center justify-center text-[#0e3824] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-display text-lg font-bold text-[#0e3824]">Your cart is empty</h3>
                <p className="text-sm text-[#5c6e64] mt-1 max-w-xs">
                  Explore our authentic Nigerian delicacies and add your favourite dishes.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 bg-[#0e3824] text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-[#154b32] transition-colors"
                >
                  Browse Food Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="p-3.5 bg-white rounded-lg border border-[#2a5e42]/10 shadow-xs flex gap-3.5 items-center"
                >
                  {/* Dish Thumbnail */}
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-[#eef5f0] shrink-0 border border-slate-100">
                    <img
                      src={item.image || '/src/assets/images/dish_jollof_deluxe_1794331885583.jpg'}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Quantity controls */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#0e3824] truncate leading-tight">
                      {item.name}
                    </h4>
                    <div className="text-xs text-[#c59b27] font-semibold tabular-nums mt-0.5">
                      {formatNaira(item.price)}
                    </div>
                    {item.specialNotes && (
                      <div className="text-[11px] text-[#6b7c72] italic truncate mt-0.5">
                        Note: {item.specialNotes}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#2a5e42]/20 rounded-md bg-[#faf8f5]">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="p-1 hover:bg-[#0e3824]/10 text-[#0e3824] transition-colors rounded-l-md"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#0e3824] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="p-1 hover:bg-[#0e3824]/10 text-[#0e3824] transition-colors rounded-r-md"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => onRemoveItem(item.menuItemId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-[#994848] hover:text-[#b32626] p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t border-[#2a5e42]/15 space-y-3">
              <div className="space-y-1.5 text-sm text-[#46594f]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#0e3824] tabular-nums">
                    {formatNaira(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({orderType === 'delivery' ? 'Standard' : 'Pickup'})</span>
                  <span className="tabular-nums">
                    {totals.deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatNaira(totals.deliveryFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-bold text-[#0e3824]">
                  <span>Total Amount</span>
                  <span className="tabular-nums text-lg text-[#0e3824]">
                    {formatNaira(totals.totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-[#0e3824] hover:bg-[#154b32] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-[#5a6c62] hover:text-[#0e3824] transition-colors text-center"
              >
                Continue Browsing Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
