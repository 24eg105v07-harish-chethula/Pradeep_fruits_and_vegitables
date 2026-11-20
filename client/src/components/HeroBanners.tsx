import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldCheck, Clock, Award } from 'lucide-react';

export const HeroBanners: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: '30-Minute Express Delivery',
      subtitle: 'PRADEEP FRUITS AND VEGETABLES',
      description: 'Handpicked farm-fresh vegetables and sweet fruits delivered to your doorstep in Bhadradri Kothagudem.',
      tag: '⚡ 30 MINS TARGET',
      code: 'DELIVERY30',
      badge: 'Farm Direct to Kitchen',
      bgGradient: 'from-emerald-700 via-emerald-800 to-emerald-950',
      accentColor: 'text-emerald-300',
      image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Flat 50% OFF First Order',
      subtitle: 'Welcome to Bhadradri Kothagudem’s Favourite Store',
      description: 'Save up to ₹100 on your daily produce, leafy greens, and exotic fruits. Minimum order ₹149.',
      tag: '🎉 WELCOME OFFER',
      code: 'WELCOME50',
      badge: 'Use code WELCOME50',
      bgGradient: 'from-teal-800 via-emerald-850 to-green-950',
      accentColor: 'text-amber-300',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: '100% Pesticide-Safe Produce',
      subtitle: 'Naturally Grown Local Harvest',
      description: 'Cleaned, hygienic and pre-sorted fresh spinach, crisp carrots, ripe tomatoes & rich dry fruits.',
      tag: '🍃 PURE & FRESH',
      code: 'FRESH30',
      badge: 'Bhadradri Verified Quality',
      bgGradient: 'from-green-800 via-emerald-900 to-gray-950',
      accentColor: 'text-lime-300',
      image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=800&q=80'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl mb-8 group">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`min-w-full bg-gradient-to-r ${banner.bgGradient} text-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative min-h-[260px] md:min-h-[290px]`}
          >
            {/* Left Content */}
            <div className="z-10 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-3 border border-white/20">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{banner.tag}</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {banner.title}
              </h2>

              <p className={`text-sm md:text-base font-semibold mt-1 ${banner.accentColor}`}>
                {banner.subtitle}
              </p>

              <p className="text-xs md:text-sm text-gray-200 mt-2 line-clamp-2 max-w-md">
                {banner.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <span className="px-3 py-1.5 bg-white text-emerald-900 rounded-xl text-xs font-bold shadow-md">
                  {banner.badge}
                </span>
                <span className="text-xs text-white/80 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-300" /> 30-Min Delivery in Bhadradri Kothagudem
                </span>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform group-hover:scale-102 transition-transform duration-500">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
