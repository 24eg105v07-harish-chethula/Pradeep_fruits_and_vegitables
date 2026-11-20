import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { useCartContext } from '../context/CartContext.tsx';
import { useAuthContext } from '../context/AuthContext.tsx';
import { useLocationContext } from '../context/LocationContext.tsx';
import api from '../services/api.ts';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    deliveryFee,
    couponDiscount,
    appliedCoupon,
    finalTotal,
    clearCart
  } = useCartContext();

  const { user, isAuthenticated, saveCustomerAddress, openAuthModal } = useAuthContext();
  const { currentArea, validatePincode, serviceAreas } = useLocationContext();

  // Address State
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [customerMobile, setCustomerMobile] = useState(user?.mobile || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState(currentArea?.areaName || 'Writer Basti');
  const [town, setTown] = useState('Kothagudem');
  const [district, setDistrict] = useState('Bhadradri Kothagudem');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState(currentArea?.pincode || '507101');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Payment Method: COD or Razorpay
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Razorpay'>('COD');

  // Status & Validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dynamicDeliveryTime, setDynamicDeliveryTime] = useState<number>(currentArea?.estimatedMinutes || 30);
  const [workloadNote, setWorkloadNote] = useState<string>('Target 30-min express delivery in Kothagudem');

  // Load saved default address if user is logged in
  useEffect(() => {
    if (user?.addresses?.length) {
      const def = user.addresses.find(a => a.isDefault) || user.addresses[0];
      if (def) {
        setHouseNo(def.houseNo);
        setStreet(def.street);
        setArea(def.area);
        setTown(def.town || 'Kothagudem');
        setDistrict(def.district || 'Bhadradri Kothagudem');
        setState(def.state || 'Telangana');
        setPincode(def.pincode);
        setLandmark(def.landmark || '');
        if (def.recipientName) setRecipientName(def.recipientName);
        if (def.customerMobile) setCustomerMobile(def.customerMobile);
      }
    }
  }, [user]);

  // Recalculate delivery estimate when pincode changes
  useEffect(() => {
    if (pincode && pincode.length === 6) {
      validatePincode(pincode).then((res) => {
        if (res.deliverable && res.estimatedMinutes) {
          setDynamicDeliveryTime(res.estimatedMinutes);
        }
      });
    }
  }, [pincode]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Add some fresh produce before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          Return to Store
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Login required</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">Please log in or register before placing an order.</p>
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          Login or Register
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate mandatory fields
    if (!recipientName.trim()) {
      setErrorMessage('Please enter recipient name.');
      return;
    }
    const cleanMobile = customerMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit customer mobile number.');
      return;
    }
    if (!houseNo.trim() || !street.trim() || !area.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in complete address details (House/Flat No, Street, Area, Pincode).');
      return;
    }

    // Validate pincode serviceability
    const zoneCheck = await validatePincode(pincode.trim());
    if (!zoneCheck.deliverable) {
      setErrorMessage(
        zoneCheck.message ||
        `Pincode ${pincode} is outside our approved service area in Bhadradri Kothagudem.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: recipientName.trim(),
        customerPhone: cleanMobile,
        customerEmail: customerEmail.trim() || undefined,
        items: cart.map(item => ({
          productId: item.product._id,
          name: item.product.name,
          selectedUnit: item.selectedUnit,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        deliveryAddress: {
          houseNo: houseNo.trim(),
          street: street.trim(),
          area: area.trim(),
          town: town.trim() || 'Kothagudem',
          district: district.trim() || 'Bhadradri Kothagudem',
          state: state.trim() || 'Telangana',
          pincode: pincode.trim(),
          landmark: landmark.trim() || undefined,
          recipientName: recipientName.trim(),
          customerMobile: cleanMobile
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        deliveryInstructions: deliveryInstructions.trim() || undefined
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data.success && res.data.order) {
        const placedOrder = res.data.order;

        // Optionally save address to customer profile
        if (isAuthenticated) {
          saveCustomerAddress(orderPayload.deliveryAddress).catch(() => {});
        }

        // Handle Razorpay Online Payment Flow
        if (paymentMethod === 'Razorpay' && res.data.razorpayOrder) {
          const rzpOrder = res.data.razorpayOrder;

          // If Razorpay SDK is loaded on window
          if (window.Razorpay && !rzpOrder.isSimulated) {
            const options = {
              key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
              amount: rzpOrder.amount,
              currency: 'INR',
              name: 'PRADEEP FRUITS AND VEGETABLES',
              description: `Order #${placedOrder.orderId} (30-Min Delivery)`,
              order_id: rzpOrder.id,
              prefill: {
                name: recipientName,
                contact: cleanMobile,
                email: customerEmail || 'customer@example.com'
              },
              theme: {
                color: '#16a34a'
              },
              handler: async (response: any) => {
                try {
                  await api.post('/orders/verify-payment', {
                    orderId: placedOrder.orderId,
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature
                  });
                  celebrateAndRedirect(placedOrder.orderId);
                } catch (vErr) {
                  setErrorMessage('Payment verification failed. Please contact store support.');
                }
              }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.open();
            setIsSubmitting(false);
            return;
          } else {
            // Simulated secure test payment for dev environment
            await api.post('/orders/verify-payment', {
              orderId: placedOrder.orderId,
              razorpayOrderId: rzpOrder.id,
              razorpayPaymentId: `pay_sim_${Date.now()}`,
              razorpaySignature: 'simulated_valid_signature'
            });
          }
        }

        celebrateAndRedirect(placedOrder.orderId);
      } else {
        setErrorMessage(res.data.message || 'Could not place order. Please check item stock.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const celebrateAndRedirect = (orderId: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    clearCart();
    navigate(`/track/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Checkout & Delivery
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Delivery by <strong>PRADEEP FRUITS AND VEGETABLES</strong> in Bhadradri Kothagudem
          </p>
        </div>

        {/* 30-Minute Guarantee Badge */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-emerald-900 shadow-sm text-xs font-bold">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
          <span>Estimated Delivery Time: <strong>{dynamicDeliveryTime} Minutes</strong></span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Address & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Delivery Address in Bhadradri Kothagudem</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. K. Pradeep"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  House / Flat / Plot No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302 / D.No 12-4-55"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Street / Road / Colony <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gandhi Nagar Main Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Area / Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    const matched = serviceAreas.find(a => a.areaName === e.target.value);
                    if (matched) {
                      setPincode(matched.pincode);
                      setTown(matched.town);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {serviceAreas.map(a => (
                    <option key={a.areaName} value={a.areaName}>
                      {a.areaName} ({a.pincode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 507101"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Town
                </label>
                <input
                  type="text"
                  value={town}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={state}
                  readOnly
                  className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Landmark <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Near Water Tank / Opposite SBI ATM"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Delivery Instructions for Store Manager / Rider
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Please ring bell twice, call upon arrival at the gate..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-gray-900 font-extrabold text-base border-b border-gray-100 pb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Select Payment Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash On Delivery */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span>Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Pay with cash or UPI directly when your fresh produce arrives at your door.
                  </p>
                </div>
              </label>

              {/* Razorpay Online Payment */}
              <label
                className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Razorpay Online Payment</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Confirmation */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 sticky top-24">
            <h3 className="font-extrabold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-semibold text-gray-500">{cart.length} items</span>
            </h3>

            {/* Items Mini List */}
            <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-gray-800 truncate">{item.product.name}</span>
                    <span className="text-[10px] text-gray-400">({item.selectedUnit})</span>
                  </div>
                  <span className="font-bold text-gray-900">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-bold">
                  {deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${deliveryFee}`}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-black text-gray-900">
                <span>Final Payable Amount</span>
                <span className="text-xl text-emerald-800">₹{finalTotal}</span>
              </div>
            </div>

            {/* Target 30-min notice */}
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>30-Minute Target Delivery Guarantee</span>
              </div>
              <p className="text-emerald-700 leading-relaxed">
                Your order is prepared immediately at our Bhadradri Kothagudem store. Fresh vegetables are weighed and packed with care.
              </p>
            </div>

            {/* Confirm & Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Place Order (₹{finalTotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
