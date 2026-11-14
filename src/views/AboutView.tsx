import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, Flame, Users, Award } from 'lucide-react';

interface AboutViewProps {
  onNavigateToMenu: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigateToMenu }) => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Header Banner */}
      <section className="bg-[#0a2316] text-white py-16 sm:py-20 border-b border-[#1b4330]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
            Our Story & Heritage
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Honouring Authentic Nigerian Flavours with Modern Culinary Art
          </h1>
          <p className="text-sm sm:text-base text-[#b1c7bc] leading-relaxed">
            Born from a lifelong passion for West African culinary traditions, The Future Kitchen is dedicated to crafting extraordinary dining moments where memory, firewood smoke, and hospitality converge.
          </p>
        </div>
      </section>

      {/* 2. Who We Are & Restaurant Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Who We Are
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824]">
              The Heart Behind The Future Kitchen
            </h2>
            <p className="text-sm sm:text-base text-[#46574d] leading-relaxed">
              Founded in Lagos, <strong>The Future Kitchen</strong> emerged from a clear vision: to celebrate the deep, unapologetic flavours of authentic Nigerian cooking while delivering the highest standards of fine dining hygiene, ambiance, and contemporary culinary craft.
            </p>
            <p className="text-sm sm:text-base text-[#46574d] leading-relaxed">
              We grew tired of generic shortcuts—powdered flavor enhancers and hurried preparations that rob dishes of their soul. In our kitchen, party Jollof rice is simmered in cast iron over aromatic hardwood fires; stockfish, shaki, and kpomo are slow-braised for hours until tender; and our suya is seasoned with stone-ground Northern Nigerian Yaji spice.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToMenu}
                className="px-6 py-3 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm"
              >
                Experience Our Menu
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-[#2a5e42]/20">
              <img
                src="/src/assets/images/restaurant_interior_1794331885410.jpg"
                alt="The Future Kitchen Restaurant Dining Room"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Food Philosophy */}
      <section className="bg-[#f3efe8] py-16 sm:py-20 border-y border-[#2a5e42]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
              Culinary Ethos
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824]">
              Our Food Philosophy
            </h2>
            <p className="text-sm text-[#4d5f54]">
              Three foundational pillars guide every dish that leaves our stoves.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#c59b27]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#0e3824]">1. Authentic Wood-Fire Craft</h3>
              <p className="text-xs sm:text-sm text-[#54655b] leading-relaxed">
                Firewood and charcoal aren’t just fuel—they are key ingredients. The distinct smoky umami of Nigerian celebration cooking cannot be faked with electric burners.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#0e3824]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#0e3824]">2. Zero Shortcuts on Sourcing</h3>
              <p className="text-xs sm:text-sm text-[#54655b] leading-relaxed">
                We partner with trusted indigenous spice growers, local fishers at the Lagos coast, and certified abattoirs to procure unadulterated palm oil, melon seeds, and fresh cuts.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-lg bg-[#eef5f0] text-[#0e3824] flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-[#c59b27]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#0e3824]">3. Hearty Portions & Warm Hospitality</h3>
              <p className="text-xs sm:text-sm text-[#54655b] leading-relaxed">
                Nigerian dining is an expression of generosity and love. We serve generous, vibrant bowls that satisfy both the palate and the spirit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Commitment to Quality & Customer Service Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-[#2a5e42]/20">
            <img
              src="/src/assets/images/dish_jollof_deluxe_1794331885583.jpg"
              alt="Artisanal Food Presentation at The Future Kitchen"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c59b27]">
                Uncompromising Standards
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0e3824] mt-1">
                Our Commitment to Quality & You
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#4d5e53] leading-relaxed">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Gold Standard Food Hygiene:</strong>
                  Our kitchen adheres to rigorous international food safety and sterilization protocols, from food prep to sealed tamper-evident packaging.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Customer-Centric Care:</strong>
                  We listen to every dietary preference and custom request. If you want milder peppers or extra plantain dodo, we cater to your taste.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0e3824] block">Prompt Delivery Across Lagos:</strong>
                  Your time matters. Our dedicated delivery riders ensure meals reach you hot, fresh, and within promised timeframes.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
