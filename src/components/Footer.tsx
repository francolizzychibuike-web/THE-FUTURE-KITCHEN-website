import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Shield, ArrowUp } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0a2316] text-[#e5ebe7] border-t border-[#1a452d]">
      {/* Top Banner section */}
      <div className="border-b border-[#1b4330] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#c59b27] font-semibold">
              The Future Kitchen
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              "FRESH FOOD. AMAZING FLAVOUR. UNFORGETTABLE MOMENTS."
            </h3>
            <p className="text-sm text-[#9eb5a8] mt-2 max-w-xl">
              Good Food. Great Moments. Authentic Nigerian cuisine prepared with heritage recipes, firewood smoke, and modern culinary precision.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActivePage('ordering');
                scrollToTop();
              }}
              className="px-6 py-3 bg-[#c59b27] hover:bg-[#d4af37] text-[#0a2316] font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-md"
            >
              Order Online Now
            </button>
            <a
              href="https://wa.me/2348034567890?text=Hello%20The%20Future%20Kitchen,%20I%20would%20like%20to%20inquire%20about%20ordering"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#1e4632] hover:bg-[#285c42] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 border border-[#2a6848]"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main 4-column Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: About & Story */}
          <div className="space-y-4">
            <h4 className="font-display text-xl font-bold text-white tracking-tight">
              THE FUTURE KITCHEN
            </h4>
            <p className="text-sm text-[#9eb5a8] leading-relaxed">
              We celebrate Nigeria's rich culinary tapestry. From legendary party Jollof to fiery slow-roasted suya and hearty native swallows, every meal is crafted to give you an unforgettable feast.
            </p>
            <div className="pt-2 text-xs text-[#c59b27] font-medium">
              RC: 1894201 · Lagos State Food & Hygiene Certified
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c59b27]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-[#9eb5a8]">
              <li>
                <button
                  onClick={() => {
                    setActivePage('home');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('menu');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Food Menu & Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('ordering');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Online Food Ordering & Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('gallery');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Photo Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('reviews');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Customer Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('about');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  About Us & Food Philosophy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('contact');
                    scrollToTop();
                  }}
                  className="hover:text-white transition-colors"
                >
                  Contact & Location
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Dining */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c59b27]">
              Opening Hours
            </h4>
            <div className="space-y-3 text-sm text-[#9eb5a8]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Monday – Saturday</div>
                  <div className="tabular-nums">8:00 AM – 10:30 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Sunday</div>
                  <div className="tabular-nums">12:00 PM – 10:00 PM</div>
                </div>
              </div>
              <div className="pt-2 text-xs text-[#c59b27]">
                Kitchen closes 30 mins before closing time.
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Address */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#c59b27]">
              Visit & Contact Us
            </h4>
            <div className="space-y-3 text-sm text-[#9eb5a8]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c59b27] shrink-0 mt-0.5" />
                <span className="text-white/90">
                  14 Adetokunbo Ademola Street, Victoria Island, Lagos, Nigeria
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href="tel:+2348034567890" className="hover:text-white tabular-nums">
                  +234 803 456 7890
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href="tel:+2348123456789" className="hover:text-white tabular-nums">
                  +234 812 345 6789
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c59b27] shrink-0" />
                <a href="mailto:orders@thefuturekitchen.ng" className="hover:text-white">
                  orders@thefuturekitchen.ng
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Admin Portal */}
      <div className="border-t border-[#143825] py-6 px-4 sm:px-6 lg:px-8 bg-[#071910]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#82998d]">
          <div>
            © {new Date().getFullYear()} The Future Kitchen. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActivePage('admin');
                scrollToTop();
              }}
              className="flex items-center gap-1.5 hover:text-[#c59b27] transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
