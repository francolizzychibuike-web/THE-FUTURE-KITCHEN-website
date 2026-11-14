import React, { useState } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, Shield, Phone, Search } from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  cartCount: number;
  openCart: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  cartCount,
  openCart,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'menu', label: 'Food Menu' },
    { id: 'ordering', label: 'Order Online' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top announcement & quick contact bar */}
      <div className="bg-[#0c2a1b] text-[#e8ede9] text-xs py-2 px-4 sm:px-8 border-b border-[#1b4330]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#c59b27] font-semibold tracking-wider uppercase text-[11px]">Victoria Island, Lagos</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span className="hidden sm:inline text-white/70">Mon–Sat: 8am–10:30pm · Sun: 12pm–10pm</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="tel:+2348034567890"
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#c59b27]" />
              <span className="tabular-nums">+234 803 456 7890</span>
            </a>
            <span className="text-white/30">|</span>
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                isAdminLoggedIn ? 'text-[#c59b27]' : 'text-white/70 hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{isAdminLoggedIn ? 'Admin Active' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#2a5e42]/10 transition-shadow duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-20">
            {/* Zone 1: Brand Wordmark */}
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group shrink-0 focus:outline-none"
            >
              <span className="block font-display text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#0e3824] leading-none group-hover:text-[#185338] transition-colors">
                THE FUTURE KITCHEN
              </span>
              <span className="block text-[10px] tracking-[0.2em] font-medium text-[#c59b27] uppercase mt-1">
                Gourmet Nigerian Dining
              </span>
            </button>

            {/* Zone 2: Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = activePage === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className={`text-sm font-medium transition-colors py-1 relative whitespace-nowrap ${
                      isActive
                        ? 'text-[#0e3824] font-semibold'
                        : 'text-[#4a5850] hover:text-[#0e3824]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0e3824] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Actions (Cart & CTA) */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Order Online quick button for desktop */}
              <button
                onClick={() => handleNavClick('ordering')}
                className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#0e3824] border border-[#0e3824]/20 rounded-md hover:bg-[#0e3824]/5 transition-colors whitespace-nowrap"
              >
                Track Order
              </button>

              {/* Shopping Cart button */}
              <button
                onClick={openCart}
                aria-label={`View cart, ${cartCount} items`}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-[#0e3824] text-white rounded-md hover:bg-[#154a32] active:scale-[0.98] transition-all shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#c59b27]" />
                <span className="text-xs font-semibold uppercase tracking-wider hidden xs:inline">Cart</span>
                <span className="min-w-[20px] h-5 px-1.5 text-[11px] font-bold bg-[#c59b27] text-[#0e3824] rounded-full flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 text-[#0e3824] hover:bg-[#0e3824]/5 rounded-md transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#faf8f5] border-b border-[#2a5e42]/15 px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0e3824] text-white font-semibold'
                      : 'text-[#2a3830] hover:bg-[#0e3824]/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className="pt-4 border-t border-[#2a5e42]/10 mt-3 flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('admin')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#0e3824] bg-white border border-[#2a5e42]/20 rounded-md"
              >
                <Shield className="w-4 h-4 text-[#c59b27]" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
