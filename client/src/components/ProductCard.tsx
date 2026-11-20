import React, { useState } from 'react';
import { Plus, Minus, Check, Sparkles } from 'lucide-react';
import { Product, ProductUnit } from '../types/index.ts';
import { useCartContext } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, changeUnit } = useCartContext();

  const availableUnits: ProductUnit[] = ['250g', '500g', '1kg', '1 piece', '1 dozen', '1 bunch', '1 packet'];

  // Current selected unit
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit>(product.unit);

  // Check if item is in cart with current unit
  const cartItem = cart.find(
    item => item.product._id === product._id && item.selectedUnit === selectedUnit
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  // Calculate dynamic unit price
  let unitMultiplier = 1;
  if (product.unit === '1kg' && selectedUnit === '500g') unitMultiplier = 0.52;
  if (product.unit === '1kg' && selectedUnit === '250g') unitMultiplier = 0.28;
  if (product.unit === '500g' && selectedUnit === '250g') unitMultiplier = 0.54;
  if (product.unit === '500g' && selectedUnit === '1kg') unitMultiplier = 1.95;

  const currentPrice = Math.round(product.price * unitMultiplier);
  const currentOriginalPrice = Math.round(product.originalPrice * unitMultiplier);
  const isOutOfStock = product.availableStock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {product.discount > 0 && (
          <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {product.isDailyOffer && (
          <span className="bg-amber-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> DAILY DEAL
          </span>
        )}
      </div>

      {/* Stock warning */}
      {product.availableStock > 0 && product.availableStock <= 5 && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
          Only {product.availableStock} left
        </span>
      )}

      {/* Image container */}
      <div className="relative pt-[70%] overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Body details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Telugu name */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {product.category}
            </span>
            {product.teluguName && (
              <span className="font-semibold text-gray-700 text-xs font-sans">
                {product.teluguName}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
            {product.description}
          </p>

          {/* Unit selector dropdown */}
          <div className="mt-2.5">
            <select
              value={selectedUnit}
              disabled={isOutOfStock}
              onChange={(e) => {
                const newUnit = e.target.value as ProductUnit;
                if (quantity > 0) {
                  changeUnit(product._id, selectedUnit, newUnit);
                }
                setSelectedUnit(newUnit);
              }}
              className="w-full text-xs font-medium bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg py-1 px-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-gray-900">
                ₹{currentPrice}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{currentOriginalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500">
              per {selectedUnit}
            </span>
          </div>

          {/* Stepper or Add button */}
          <div>
            {quantity > 0 ? (
              <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200 font-bold overflow-hidden">
                <button
                  onClick={() => updateQuantity(product._id, quantity - 1, selectedUnit)}
                  className="px-2.5 py-1.5 hover:bg-emerald-700 transition-colors flex items-center justify-center"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-extrabold min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product._id, quantity + 1, selectedUnit)}
                  disabled={quantity >= product.availableStock}
                  className="px-2.5 py-1.5 hover:bg-emerald-700 transition-colors flex items-center justify-center disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, selectedUnit)}
                disabled={isOutOfStock}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ADD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
