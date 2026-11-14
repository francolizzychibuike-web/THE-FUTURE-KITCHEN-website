import React from 'react';
import { ArrowRight, Star, Clock, ShieldCheck, Flame, UtensilsCrossed, Sparkles, Truck } from 'lucide-react';
import { MenuItem, Review, RestaurantSettings } from '../types/restaurant';
import { formatNaira } from '../utils/ordering';

interface HomeViewProps {
  menuItems: MenuItem[];
  reviews: Review[];
  settings: RestaurantSettings | null;
  onSelectDish: (dish: MenuItem) => void;
  onAddToCart: (dish: MenuItem) => void;
  onNavigate: (page: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  menuItems,
  reviews,
  settings,
  onSelectDish,
  onAddToCart,
  onNavigate,
}) => {
  const featuredDishes = menuItems.filter((item) => item.isFeatured).slice(0, 6);
  const approvedReviews = reviews.filter((r) => r.status === 'approved').slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#0a2417] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18452e] border border-[#2a6645] rounded-full text-xs font-semibold text-[#c59b27] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Future Kitchen · Lagos Fine Dining</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white text-balance">
                Good Food. <br />
                <span className="text-[#d4af37] italic">Great Moments.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#b8cfc3] max-w-xl leading-relaxed">
                "FRESH FOOD. AMAZING FLAVOUR. UNFORGETTABLE MOMENTS."
              </p>

              <p className="text-sm sm:text-base text-[#92ad9f] max-w-xl leading-relaxed">
                Welcome to The Future Kitchen. We craft authentic Nigerian culinary masterworks—from wood-fire party Jollof rice and artisanal beef suya to rich, slow-simmered Egusi soup and fresh seafood platters.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigate('ordering')}
                  className="px-7 py-3.5 bg-[#c59b27] hover:bg-[#d4af37] text-[#0a2417] font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex items-center gap-2"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('menu')}
                  className="px-7 py-3.5 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white font-semibold text-xs uppercase tracking-wider rounded-md transition-all flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4 text-[#c59b27]" />
                  <span>Explore Menu</span>
                </button>
              </div>

              {/* Quick stats / Highlights strip */}
              <div className="pt-6 border-t border-[#1b4832] grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white tabular-nums">100%</div>
                  <div className="text-xs text-[#8daea0]">Firewood Aroma</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white tabular-nums">30 Mins</div>
                  <div className="text-xs text-[#8daea0]">Average Delivery</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-white tabular-nums">4.9 ★</div>
                  <div className="text-xs text-[#8daea0]">Customer Rating</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#2b6647]/40 relative group">
                  <img
                    src="/src/assets/images/hero_nigerian_feast_1794331884704.jpg"
                    alt="Authentic Nigerian Royal Feast at The Future Kitchen"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#d4af37]">
                      Chef’s Masterpiece
                    </span>
                    <h3 className="font-display text-xl font-bold mt-0.5">
                      The Grand Nigerian Banquet
                    </h3>
                    <p className="text-xs text-[#d1dfd8] mt-1 line-clamp-2">
                      Firewood smokey jollof, tiger prawns, tender peppered asun, and sweet plantains.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Restaurant Introduction & Story Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#2a5e42]/10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 aspect-4/3 rounded-xl overflow-hidden bg-[#eef5f0]">
            <img
              src="/src/assets/images/restaurant_interior_1794331885410.jpg"
              alt="The Future Kitchen Elegant Dining Space"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Our Heritage & Vision
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824]">
              Where Tradition Meets Modern Culinary Excellence
            </h2>
            <p className="text-sm sm:text-base text-[#46594f] leading-relaxed">
              At <strong>The Future Kitchen</strong>, we believe food is more than sustenance—it is memory, culture, and celebration. Rooted in time-honoured Nigerian culinary recipes, our kitchen elevates traditional African flavours using premium hand-picked ingredients, authentic open-fire grilling, and modern packaging designed to preserve every drop of warmth and aroma.
            </p>
            <p className="text-sm text-[#5a6c62] leading-relaxed">
              Whether you are dining in our serene Victoria Island dining room or ordering swift delivery to your home or office, we guarantee an exceptional gastronomic journey every single time.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e3824] uppercase tracking-wider hover:text-[#185538] transition-colors group"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Dishes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Customer Favourites
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824] mt-1">
              Featured Signature Dishes
            </h2>
            <p className="text-sm text-[#5c6e64] mt-1">
              Handcrafted delicacies prepared fresh upon order by our executive chefs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-bold uppercase tracking-wider text-[#0e3824] hover:text-[#1a5b3a] flex items-center gap-1 shrink-0"
          >
            <span>View All Menu Dishes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-xl border border-[#2a5e42]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Dish Photo */}
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
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    onClick={() => onSelectDish(dish)}
                    className="font-display text-lg font-bold text-[#0e3824] hover:text-[#195a3a] cursor-pointer line-clamp-1"
                  >
                    {dish.name}
                  </h3>
                  <p className="text-xs text-[#52645a] mt-1.5 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
                    <span className="font-display text-lg font-bold text-[#0e3824] tabular-nums">
                      {formatNaira(dish.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDish(dish)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#0e3824] hover:bg-[#0e3824]/5 rounded-md transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onAddToCart(dish)}
                      disabled={!dish.isAvailable}
                      className="px-4 py-2 bg-[#0e3824] hover:bg-[#154e33] active:scale-[0.98] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-all shadow-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section className="bg-[#f2eee7] py-16 sm:py-20 border-y border-[#2a5e42]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              The Future Kitchen Standard
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824] mt-1">
              Why Diners Trust Our Kitchen
            </h2>
            <p className="text-sm text-[#4b5d52] mt-2">
              Uncompromising dedication to food safety, authenticity, and extraordinary customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#c59b27]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0e3824]">Wood-Fire Authenticity</h3>
              <p className="text-xs text-[#52645a] leading-relaxed">
                Genuine firewood smoking techniques that infuse our Jollof rice and grilled meats with unforgettable flavour.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#0e3824]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0e3824]">Farm-Fresh Ingredients</h3>
              <p className="text-xs text-[#52645a] leading-relaxed">
                Daily sourced organic spices, fresh Atlantic seafood, and farm-raised meats inspected to highest hygiene standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#c59b27]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0e3824]">Swift & Hot Delivery</h3>
              <p className="text-xs text-[#52645a] leading-relaxed">
                Insulated thermal food packaging guarantees your orders arrive steaming hot and spill-free across Lagos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-[#0e3824]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0e3824]">Heritage Master Chefs</h3>
              <p className="text-xs text-[#52645a] leading-relaxed">
                Decades of specialized Nigerian culinary expertise recreating regional delicacies with fine dining precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Customer Reviews
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824] mt-1">
              What Our Guests Say
            </h2>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="text-xs font-bold uppercase tracking-wider text-[#0e3824] hover:text-[#1b5b3b] flex items-center gap-1 shrink-0"
          >
            <span>Read All Reviews or Share Feedback</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-1 text-[#c59b27] mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'fill-[#c59b27] text-[#c59b27]' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#3b4c42] italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#0e3824] block">{review.customerName}</span>
                  {review.dishOrdered && (
                    <span className="text-[11px] text-[#6b7d72]">{review.dishOrdered}</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">Verified Diner</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Opening Hours & Contact Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0e3824] text-white rounded-2xl p-8 sm:p-12 shadow-xl border border-[#2b6647]/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                Ready for an unforgettable meal?
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Order Online for Swift Delivery or Reserve a Table
              </h2>
              <p className="text-sm text-[#b2cebf] max-w-xl">
                Open Monday to Saturday 8:00 AM – 10:30 PM, Sunday 12:00 PM – 10:00 PM. Call us at <strong>+234 803 456 7890</strong> or order directly online.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => onNavigate('ordering')}
                className="w-full py-3.5 px-6 bg-[#c59b27] hover:bg-[#d4af37] text-[#0a2417] font-bold text-xs uppercase tracking-wider rounded-md transition-colors text-center shadow-md"
              >
                Place Order Online
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-3.5 px-6 bg-transparent hover:bg-white/10 text-white border border-white/30 rounded-md font-semibold text-xs uppercase tracking-wider transition-colors text-center"
              >
                Find Us on Map
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
