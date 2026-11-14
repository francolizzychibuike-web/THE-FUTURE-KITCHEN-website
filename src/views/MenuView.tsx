import React, { useState, useMemo } from 'react';
import { Search, Flame, Clock, ShoppingBag, Check } from 'lucide-react';
import { MenuItem, FoodCategory, FOOD_CATEGORIES } from '../types/restaurant';
import { formatNaira } from '../utils/ordering';

interface MenuViewProps {
  menuItems: MenuItem[];
  onSelectDish: (dish: MenuItem) => void;
  onAddToCart: (dish: MenuItem) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  menuItems,
  onSelectDish,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [spicinessFilter, setSpicinessFilter] = useState<string>('All');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const categories = ['All', ...FOOD_CATEGORIES];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Spiciness filter
      if (spicinessFilter !== 'All' && item.spiciness !== spicinessFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, spicinessFilter, searchQuery]);

  const handleAdd = (dish: MenuItem) => {
    onAddToCart(dish);
    setJustAddedId(dish.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
          Culinary Excellence
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0e3824]">
          Our Food Menu
        </h1>
        <p className="text-sm sm:text-base text-[#4d5e53]">
          Authentic Nigerian recipes cooked fresh daily with locally-sourced spices, slow smoke, and master culinary craft.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by dish name, eg. Jollof, Suya, Egusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2c23] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
            />
          </div>

          {/* Spice level filter */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs">
            <span className="text-[#59695f] font-medium whitespace-nowrap">Spice Level:</span>
            <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-md border border-[#2a5e42]/15">
              {['All', 'Mild', 'Medium', 'Hot'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSpicinessFilter(lvl)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    spicinessFilter === lvl
                      ? 'bg-[#0e3824] text-white shadow-xs'
                      : 'text-[#4b5a51] hover:text-[#0e3824]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-100">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
                  isSelected
                    ? 'bg-[#0e3824] text-white shadow-sm'
                    : 'bg-[#faf8f5] text-[#4d5e53] hover:bg-[#eef5f0] hover:text-[#0e3824] border border-[#2a5e42]/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovered Dish Count & Active Filter indicator */}
      <div className="flex items-center justify-between text-xs text-[#52645a]">
        <div>
          Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'dish' : 'dishes'}
          {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
        </div>
        {(selectedCategory !== 'All' || spicinessFilter !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSpicinessFilter('All');
              setSearchQuery('');
            }}
            className="text-[#994848] hover:text-[#b32626] font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Menu Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#2a5e42]/10 shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#eef5f0] text-[#0e3824] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#0e3824]">No dishes found</h3>
          <p className="text-xs text-[#586a5f] mt-1">
            Try adjusting your search terms or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSpicinessFilter('All');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-[#0e3824] text-white text-xs font-semibold uppercase tracking-wider rounded-md"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((dish) => {
            const isJustAdded = justAddedId === dish.id;

            return (
              <div
                key={dish.id}
                className="bg-white rounded-xl border border-[#2a5e42]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Photo & badges */}
                <div
                  onClick={() => onSelectDish(dish)}
                  className="aspect-4/3 overflow-hidden bg-[#eef5f0] relative cursor-pointer"
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#0a2417]/80 backdrop-blur-xs text-[#c59b27] px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wider uppercase">
                    {dish.category}
                  </div>

                  {dish.spiciness && dish.spiciness !== 'None' && (
                    <div className="absolute top-3 right-3 bg-white/90 text-[#b53416] px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <Flame className="w-3 h-3 text-[#d13a17]" />
                      <span>{dish.spiciness}</span>
                    </div>
                  )}

                  {!dish.isAvailable && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-900/90 text-white text-xs font-bold uppercase tracking-wider rounded-md">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => onSelectDish(dish)}
                      className="font-display text-lg font-bold text-[#0e3824] hover:text-[#175234] cursor-pointer line-clamp-1 leading-snug"
                    >
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#52645a] line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {dish.preparationTime && (
                      <div className="flex items-center gap-1 text-[11px] text-[#6b7c72] pt-1">
                        <Clock className="w-3 h-3 text-[#c59b27]" />
                        <span>Ready in {dish.preparationTime}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Action button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
                      <span className="font-display text-xl font-bold text-[#0e3824] tabular-nums">
                        {formatNaira(dish.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectDish(dish)}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#0e3824] hover:bg-[#0e3824]/5 rounded-md transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAdd(dish)}
                        disabled={!dish.isAvailable}
                        aria-label={`Add ${dish.name} to cart`}
                        className={`px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs ${
                          !dish.isAvailable
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : isJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#0e3824] hover:bg-[#154e33] active:scale-[0.98] text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#c59b27]" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
