import React, { useState } from 'react';
import { GalleryItem } from '../types/restaurant';
import { X, ZoomIn, Sparkles } from 'lucide-react';

interface GalleryViewProps {
  galleryItems: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryItems }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    'All',
    'Nigerian Meals',
    'Restaurant Interior',
    'Grilled Dishes',
    'Drinks',
    'Special Presentations',
  ];

  const filteredItems = selectedCategory === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
          Visual Culinary Art
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0e3824]">
          Photo Gallery
        </h1>
        <p className="text-sm sm:text-base text-[#4d5e53]">
          Take a peek into our kitchen, our elegant Victoria Island dining spaces, and our vibrant celebration of Nigerian gastronomy.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-md transition-all ${
                isSelected
                  ? 'bg-[#0e3824] text-white shadow-sm'
                  : 'bg-white text-[#4d5e53] hover:bg-[#eef5f0] hover:text-[#0e3824] border border-[#2a5e42]/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setLightboxItem(item)}
            className="group relative aspect-4/3 rounded-xl overflow-hidden bg-[#eef5f0] cursor-pointer border border-[#2a5e42]/10 shadow-xs hover:shadow-xl transition-all duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Hover zoom indicator */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                {item.category}
              </span>
              <h3 className="font-display text-lg font-bold mt-0.5 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-[#d1ded7] mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full bg-[#0a2316] rounded-2xl overflow-hidden shadow-2xl border border-[#2a5e42]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-black overflow-hidden flex items-center justify-center">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 text-white bg-[#0e3824]">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                {lightboxItem.category}
              </span>
              <h2 className="font-display text-2xl font-bold mt-1">
                {lightboxItem.title}
              </h2>
              <p className="text-sm text-[#b5cbbf] mt-2 leading-relaxed">
                {lightboxItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
