import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Zap, AlertCircle, Check } from 'lucide-react';
import { useCartContext } from '../context/CartContext.tsx';
import { useLocationContext } from '../context/LocationContext.tsx';
import { ProductUnit } from '../types/index.ts';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    changeUnit,
    subtotal,
    deliveryFee,
    discountSavings,
    couponDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    finalTotal,
    itemCount
  } = useCartContext();

  const { currentArea } = useLocationContext();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const minOrder = currentArea?.minimumOrder || 99;
  const isBelowMinOrder = subtotal < minOrder;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponMsg(null);
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const availableUnits: ProductUnit[] = ['250g', '500g', '1kg', '1 piece', '1 dozen', '1 bunch', '1 packet'];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slideLeft">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-800 text-white">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">My Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery Promise Bar */}
          <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
              <span>Delivering to <strong>{currentArea?.areaName || 'Bhadradri Kothagudem'}</strong></span>
            </div>
            <span className="bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded font-extrabold text-[11px]">
              ~{currentArea?.estimatedMinutes || 30} mins
            </span>
          </div>

          {/* Body items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-3xl mb-3">
                  🧺
                </div>
                <h4 className="text-base font-bold text-gray-800">Your cart is empty</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  Add fresh vegetables, seasonal fruits, and groceries to enjoy express 30-min delivery.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                >
                  Browse Fresh Produce
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product._id}-${item.selectedUnit}-${idx}`}
                    className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center gap-3"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 p-1">
                      <img
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      {item.product.teluguName && (
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.product.teluguName}
                        </p>
                      )}

                      {/* Unit Selector */}
                      <div className="mt-1 flex items-center gap-2">
                        <select
                          value={item.selectedUnit}
                          onChange={(e) => changeUnit(item.product._id, item.selectedUnit, e.target.value as ProductUnit)}
                          className="text-[11px] font-medium bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 cursor-pointer focus:outline-none"
                        >
                          {availableUnits.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        <span className="text-xs font-bold text-gray-900">
                          ₹{item.unitPrice}
                        </span>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center bg-white border border-emerald-300 rounded-xl overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.selectedUnit)}
                          className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-emerald-950 min-w-[18px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.selectedUnit)}
                          className="px-2 py-1 text-emerald-700 hover:bg-emerald-50 transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Promotional Coupon Box */}
                <div className="pt-2">
                  <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Apply Discount Coupon</span>
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-emerald-700">{appliedCoupon.code}</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              APPLIED
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            You saved ₹{couponDiscount} with this coupon!
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Try WELCOME50 or FRESH30"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={isApplying || !couponInput.trim()}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                        >
                          {isApplying ? 'Applying...' : 'Apply'}
                        </button>
                      </form>
                    )}

                    {couponMsg && (
                      <div className={`mt-2 text-[11px] flex items-center gap-1 font-medium ${
                        couponMsg.success ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {couponMsg.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{couponMsg.text}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  <div className="font-bold text-gray-900 text-xs pb-1 border-b border-gray-200">
                    Bill Summary
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-gray-900">₹{subtotal}</span>
                  </div>

                  {discountSavings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Product MRP Discounts</span>
                      <span>-₹{discountSavings}</span>
                    </div>
                  )}

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 items-center">
                    <span>
                      Delivery Charge
                      {currentArea?.freeDeliveryThreshold && (
                        <span className="block text-[10px] text-gray-400">
                          (Free for orders above ₹{currentArea.freeDeliveryThreshold})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[11px]">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-sm font-extrabold text-gray-900">
                    <span>To Pay</span>
                    <span className="text-base text-emerald-800">₹{finalTotal}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer CTA */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white space-y-2">
              {isBelowMinOrder ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Minimum order for <strong>{currentArea?.areaName}</strong> is <strong>₹{minOrder}</strong>. Add ₹{minOrder - subtotal} more.
                  </span>
                </div>
              ) : null}

              <button
                onClick={handleProceedToCheckout}
                disabled={isBelowMinOrder}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-200 transition-all flex items-center justify-between px-5 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                <div>
                  <div className="text-[10px] text-emerald-100 uppercase tracking-wider font-semibold">Total Amount</div>
                  <div className="text-base font-extrabold">₹{finalTotal}</div>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
