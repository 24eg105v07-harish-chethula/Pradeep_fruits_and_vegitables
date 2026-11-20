import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Zap,
  ShoppingBag,
  Share2,
  RotateCcw
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import api from '../services/api.ts';
import { getSocket } from '../services/socket.ts';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string; icon: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', desc: 'Received by store', icon: '📝' },
  { status: 'Order Confirmed', label: 'Order Confirmed', desc: 'Accepted by Pradeep store', icon: '✅' },
  { status: 'Preparing', label: 'Preparing Fresh Produce', desc: 'Handpicked and weighed', icon: '🥦' },
  { status: 'Packed', label: 'Packed & Ready', desc: 'Sealed for 30-min delivery', icon: '📦' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way', icon: '🛵' },
  { status: 'Delivered', label: 'Delivered', desc: 'Enjoy fresh produce!', icon: '🏡' }
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    fetchOrderDetails();

    // Setup Socket.IO listener for real-time status updates
    const socket = getSocket();
    socket.emit('join_order_room', orderId);

    socket.on('order_status_changed', (data: any) => {
      if (data.orderId === orderId && data.order) {
        setOrder(data.order);
      }
    });

    return () => {
      socket.off('order_status_changed');
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders/track/${orderId}`);
      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Could not find order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsCancelling(true);
    try {
      const res = await api.post(`/orders/cancel/${order.orderId}`);
      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
      } else {
        alert(res.data.message || 'Could not cancel order.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-gray-700">Connecting to real-time order tracking...</p>
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          {errorMsg || `No active order found with ID #${orderId}`}
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const isDelivered = order.orderStatus === 'Delivered';
  const currentStepIndex = isCancelled
    ? -1
    : STATUS_STEPS.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </Link>

        <button
          onClick={() => setShowInvoice(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-sm transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-700" />
          <span>View Tax Invoice</span>
        </button>
      </div>

      {/* Main Tracking Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mb-8">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Real-Time Tracking
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            <h1 className="text-2xl font-black mt-1">Order #{order.orderId}</h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="text-left sm:text-right bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
            <div className="text-[10px] uppercase font-bold text-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span>Target Delivery Time</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {isDelivered ? 'Delivered' : `~${order.estimatedDeliveryTime} Mins`}
            </div>
            <div className="text-[11px] text-emerald-100">
              {order.deliveryAddress.area}, Bhadradri Kothagudem
            </div>
          </div>
        </div>

        {/* Live Status Tracker Progress Bar */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
                ✕
              </div>
              <div>
                <h4 className="font-extrabold text-sm">Order Cancelled</h4>
                <p className="text-xs text-red-600 mt-0.5">
                  This order was cancelled. Any reserved stock has been safely restored.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden md:block absolute top-6 left-6 right-6 h-1 bg-gray-200 z-0">
                <div
                  className="h-full bg-emerald-600 transition-all duration-700 ease-in-out"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`
                  }}
                />
              </div>

              {/* Status Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="flex flex-col items-center text-center group">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all shadow-md ${
                          isCurrent
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-200 scale-110'
                            : isDone
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-gray-400 border border-gray-200'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span className={`text-xs font-bold mt-2.5 leading-tight ${
                        isCurrent ? 'text-emerald-800' : isDone ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancel Button (only when eligible: 'Order Placed') */}
          {order.orderStatus === 'Order Placed' && (
            <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Need to change something? You can cancel before store confirmation.
              </span>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

        {/* Order Details & Summary Grid */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Items in Order */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              <span>Ordered Items ({order.items.length})</span>
            </h3>

            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center gap-3"
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="w-12 h-12 object-contain bg-white rounded-xl p-1 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.unit} • {item.quantity} qty</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-xs text-gray-900">₹{item.totalPrice}</p>
                    <p className="text-[10px] text-gray-400">₹{item.price}/{item.unit}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span>-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-emerald-200 flex justify-between font-black text-sm text-gray-900">
                <span>Total Paid / Payable:</span>
                <span className="text-base text-emerald-800">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Right: Delivery Address & Store Notes */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Delivery Details</span>
            </h3>

            <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <p className="font-extrabold text-gray-900 text-sm">{order.deliveryAddress.recipientName}</p>
              <p className="text-gray-600 font-medium">
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.area}, {order.deliveryAddress.town || 'Kothagudem'}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-gray-500 italic">Landmark: {order.deliveryAddress.landmark}</p>
              )}
              <p className="text-emerald-800 font-bold pt-1">
                Customer Mobile: +91 {order.deliveryAddress.customerMobile}
              </p>
            </div>

            {/* Payment & instructions */}
            <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-gray-900">
                  {order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Razorpay Online Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Payment Status:</span>
                <span className="font-bold text-emerald-700 uppercase">{order.paymentStatus}</span>
              </div>
              {order.deliveryInstructions && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block mb-0.5">Delivery Instructions:</span>
                  <p className="text-gray-800 italic bg-white p-2 rounded-lg border border-gray-200">
                    "{order.deliveryInstructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Support hotline */}
            <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase">Store Helpline</p>
                <p className="text-sm font-extrabold">+91 98765 43210</p>
                <p className="text-[10px] text-emerald-200">Pradeep Fruits & Veg Store, Kothagudem</p>
              </div>
              <a
                href="tel:9876543210"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow"
              >
                Call Store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
