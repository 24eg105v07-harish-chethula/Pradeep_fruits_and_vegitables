import React from 'react';
import { Category } from '../types/index.ts';

interface CategorySliderProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Shop By Category
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Farm-fresh essentials delivered in 30 minutes in Bhadradri Kothagudem
          </p>
        </div>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
          >
            View All Products
          </button>
        )}
      </div>

      {/* Horizontal Scroll List */}
      <div className="flex items-center gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
        {/* All Products pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`shrink-0 flex flex-col items-center gap-2 p-2.5 rounded-2xl border transition-all duration-200 min-w-[95px] max-w-[105px] text-center ${
            selectedCategory === 'all'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-200 scale-102'
              : 'bg-white text-gray-700 border-gray-100 hover:border-emerald-300 hover:shadow-md'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold ${
            selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
          }`}>
            🛒
          </div>
          <span className="text-xs font-bold leading-tight">All Items</span>
        </button>

        {/* Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
          return (
            <button
              key={cat._id || cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`shrink-0 flex flex-col items-center gap-2 p-2.5 rounded-2xl border transition-all duration-200 min-w-[95px] max-w-[105px] text-center ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg shadow-emerald-200 scale-102'
                  : 'bg-white text-gray-700 border-gray-100 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 relative p-1">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                />
              </div>
              <span className="text-xs font-bold leading-tight line-clamp-2">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
