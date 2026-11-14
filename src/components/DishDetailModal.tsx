import React, { useState } from 'react';
import { X, Clock, Flame, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { MenuItem } from '../types/restaurant';
import { formatNaira } from '../utils/ordering';

interface DishDetailModalProps {
  dish: MenuItem | null;
  onClose: () => void;
  onAddToCart: (dish: MenuItem, quantity: number, specialNotes?: string) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  dish,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialNotes, setSpecialNotes] = useState('');
  const [added, setAdded] = useState(false);

  if (!dish) return null;

  const handleAdd = () => {
    onAddToCart(dish, quantity, specialNotes.trim() ? specialNotes.trim() : undefined);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="dish-modal-title">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Window */}
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-[#2a5e42]/20 animate-in fade-in-50 zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close dish details"
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Dish Image */}
          <div className="relative h-64 sm:h-72 w-full bg-[#1e3c2c] overflow-hidden">
            <img
              src={dish.image}
              alt={dish.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4af37]">
                {dish.category}
              </span>
              <h3 id="dish-modal-title" className="font-display text-xl sm:text-2xl font-bold leading-tight mt-0.5">
                {dish.name}
              </h3>
            </div>
          </div>

          {/* Body details */}
          <div className="p-6 space-y-5 bg-[#faf8f5]">
            {/* Price & Availability row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a5e42]/10">
              <div className="font-display text-2xl font-bold text-[#0e3824] tabular-nums">
                {formatNaira(dish.price)}
              </div>
              <div>
                {dish.isAvailable ? (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                    In Stock · Ready to Cook
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-800 bg-rose-100/80 px-2.5 py-1 rounded-md">
                    Currently Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#3b4c42] leading-relaxed">
              {dish.description}
            </p>

            {/* Meta tags: prep time, spiciness */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#526359] pt-1">
              {dish.preparationTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#c59b27]" />
                  <span>Prep: {dish.preparationTime}</span>
                </div>
              )}
              {dish.spiciness && (
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#e05230]" />
                  <span>Spice: {dish.spiciness}</span>
                </div>
              )}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">·</span>
                  <span>{dish.tags.join(' · ')}</span>
                </div>
              )}
            </div>

            {/* Special Instructions Input */}
            <div className="space-y-1.5">
              <label htmlFor="special-notes" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Special Requests or Dietary Notes (Optional)
              </label>
              <textarea
                id="special-notes"
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Mild pepper, separate stew, extra fried plantain dodo..."
                className="w-full text-xs p-2.5 rounded-md border border-[#2a5e42]/20 bg-white text-[#1f2d25] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                maxLength={200}
              />
            </div>

            {/* Quantity Stepper & Add Button */}
            <div className="pt-2 flex items-center gap-4">
              <div className="flex items-center border border-[#2a5e42]/20 rounded-md bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  className="p-1.5 hover:bg-[#0e3824]/10 text-[#0e3824] rounded-sm transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-[#0e3824] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="p-1.5 hover:bg-[#0e3824]/10 text-[#0e3824] rounded-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!dish.isAvailable}
                onClick={handleAdd}
                className={`flex-1 py-3 px-4 rounded-md font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  !dish.isAvailable
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#0e3824] hover:bg-[#164e33] active:scale-[0.99] text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                    <span>Add {quantity} to Cart · {formatNaira(dish.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
