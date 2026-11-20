import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductUnit, Coupon } from '../types/index.ts';
import { useLocationContext } from './LocationContext.tsx';
import api from '../services/api.ts';

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, unit?: ProductUnit) => void;
  removeFromCart: (productId: string, unit?: ProductUnit) => void;
  updateQuantity: (productId: string, quantity: number, unit?: ProductUnit) => void;
  changeUnit: (productId: string, oldUnit: ProductUnit, newUnit: ProductUnit) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  subtotal: number;
  deliveryFee: number;
  discountSavings: number;
  couponDiscount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  finalTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentArea } = useLocationContext();

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pfv_shopping_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('pfv_applied_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('pfv_shopping_cart', JSON.stringify(cart));
  }, [cart]);

  // Save coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('pfv_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('pfv_applied_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, unit?: ProductUnit) => {
    const selectedUnit = unit || product.unit;

    // Calculate price ratio if unit differs from default
    let unitMultiplier = 1;
    if (product.unit === '1kg' && selectedUnit === '500g') unitMultiplier = 0.52;
    if (product.unit === '1kg' && selectedUnit === '250g') unitMultiplier = 0.28;
    if (product.unit === '500g' && selectedUnit === '250g') unitMultiplier = 0.54;
    if (product.unit === '500g' && selectedUnit === '1kg') unitMultiplier = 1.95;

    const unitPrice = Math.round(product.price * unitMultiplier);

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product._id === product._id && item.selectedUnit === selectedUnit
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + 1;
        if (newQty <= product.availableStock) {
          updated[existingIndex].quantity = newQty;
        }
        return updated;
      } else {
        return [...prev, { product, quantity: 1, selectedUnit, unitPrice }];
      }
    });
  };

  const removeFromCart = (productId: string, unit?: ProductUnit) => {
    setCart(prev =>
      prev.filter(item => {
        if (unit) {
          return !(item.product._id === productId && item.selectedUnit === unit);
        }
        return item.product._id !== productId;
      })
    );
  };

  const updateQuantity = (productId: string, quantity: number, unit?: ProductUnit) => {
    if (quantity <= 0) {
      removeFromCart(productId, unit);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        const match = unit
          ? item.product._id === productId && item.selectedUnit === unit
          : item.product._id === productId;

        if (match) {
          const maxStock = item.product.availableStock || 99;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const changeUnit = (productId: string, oldUnit: ProductUnit, newUnit: ProductUnit) => {
    setCart(prev => {
      const item = prev.find(i => i.product._id === productId && i.selectedUnit === oldUnit);
      if (!item) return prev;

      // Calculate unit multiplier
      let unitMultiplier = 1;
      if (item.product.unit === '1kg' && newUnit === '500g') unitMultiplier = 0.52;
      if (item.product.unit === '1kg' && newUnit === '250g') unitMultiplier = 0.28;
      if (item.product.unit === '500g' && newUnit === '250g') unitMultiplier = 0.54;
      if (item.product.unit === '500g' && newUnit === '1kg') unitMultiplier = 1.95;

      const unitPrice = Math.round(item.product.price * unitMultiplier);

      const filtered = prev.filter(i => !(i.product._id === productId && i.selectedUnit === oldUnit));
      return [...filtered, { ...item, selectedUnit: newUnit, unitPrice }];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('pfv_shopping_cart');
    localStorage.removeItem('pfv_applied_coupon');
  };

  const getItemQuantity = (productId: string): number => {
    return cart
      .filter(item => item.product._id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Original price savings
  const totalOriginal = cart.reduce((sum, item) => {
    const orig = item.product.originalPrice || item.product.price;
    return sum + orig * item.quantity;
  }, 0);
  const discountSavings = Math.max(0, totalOriginal - subtotal);

  // Delivery charge based on active area & free delivery threshold
  let deliveryFee = currentArea?.deliveryCharge || 20;
  if (currentArea?.freeDeliveryThreshold && subtotal >= currentArea.freeDeliveryThreshold) {
    deliveryFee = 0;
  }
  if (subtotal === 0) deliveryFee = 0;

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    const calc = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
    couponDiscount = Math.min(calc, appliedCoupon.maxDiscountAmount);
  }

  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.post('/coupons/validate', { code, cartTotal: subtotal });
      if (res.data.success && res.data.coupon) {
        setAppliedCoupon({
          _id: `cp_${Date.now()}`,
          code: res.data.coupon.code,
          description: res.data.coupon.description,
          discountPercentage: res.data.coupon.discountPercentage,
          minOrderValue: 0,
          maxDiscountAmount: res.data.coupon.discountAmount,
          isActive: true,
          validUntil: '2028-12-31'
        });
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Invalid coupon code' };
    } catch (err: any) {
      // Local fallback coupon validation
      const upper = code.toUpperCase().trim();
      if (upper === 'WELCOME50' && subtotal >= 149) {
        const disc = Math.min(Math.round(subtotal * 0.5), 100);
        setAppliedCoupon({
          _id: 'cp_w50',
          code: 'WELCOME50',
          description: 'Flat 50% OFF up to ₹100',
          discountPercentage: 50,
          minOrderValue: 149,
          maxDiscountAmount: disc,
          isActive: true,
          validUntil: '2028-12-31'
        });
        return { success: true, message: `Coupon WELCOME50 applied! You saved ₹${disc}` };
      }
      if (upper === 'FRESH30' && subtotal >= 199) {
        const disc = Math.min(Math.round(subtotal * 0.3), 75);
        setAppliedCoupon({
          _id: 'cp_f30',
          code: 'FRESH30',
          description: 'Save 30% up to ₹75',
          discountPercentage: 30,
          minOrderValue: 199,
          maxDiscountAmount: disc,
          isActive: true,
          validUntil: '2028-12-31'
        });
        return { success: true, message: `Coupon FRESH30 applied! You saved ₹${disc}` };
      }
      if (upper === 'KOTHAGUDEM' && subtotal >= 299) {
        setAppliedCoupon({
          _id: 'cp_k50',
          code: 'KOTHAGUDEM',
          description: '₹50 OFF on orders above ₹299',
          discountPercentage: 20,
          minOrderValue: 299,
          maxDiscountAmount: 50,
          isActive: true,
          validUntil: '2028-12-31'
        });
        return { success: true, message: `Coupon KOTHAGUDEM applied! You saved ₹50` };
      }

      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code or minimum order condition not met'
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        changeUnit,
        clearCart,
        getItemQuantity,
        subtotal,
        deliveryFee,
        discountSavings,
        couponDiscount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        finalTotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
