import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { Order } from '../types/index.ts';

export const MyOrdersPage: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [phoneLookup, setPhoneLookup] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated && user?.mobile) {
      fetchOrders(user.mobile);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async (phone: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/orders/my-orders?phone=${phone}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Could not load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneLookup.trim()) return;
    const clean = phoneLookup.replace(/\D/g, '').slice(-10);
    fetchOrders(clean);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-gray-500 font-medium">
            Track active orders or view history in Bhadradri Kothagudem
          </p>
        </div>

        {!isAuthenticated && (
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Login to Auto-Sync
          </button>
        )}
      </div>

      {/* Guest Phone Lookup if not logged in */}
      {!isAuthenticated && (
        <div className="mb-8 p-6 bg-emerald-50/70 rounded-3xl border border-emerald-100">
          <h3 className="font-bold text-sm text-emerald-950 mb-1">
            Check Orders by Mobile Number
          </h3>
          <p className="text-xs text-emerald-800/80 mb-3">
            Enter the 10-digit mobile number used when placing your grocery order.
          </p>
          <form onSubmit={handlePhoneSearch} className="flex gap-2 max-w-md">
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9848012345"
              value={phoneLookup}
              onChange={(e) => setPhoneLookup(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              Find Orders
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-gray-600">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-3">
            🛍️
          </div>
          <h3 className="text-base font-bold text-gray-900">No Orders Found</h3>
          <p className="text-xs text-gray-500 mt-1 mb-5 max-w-sm mx-auto">
            You haven't placed any orders with PRADEEP FRUITS AND VEGETABLES yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id || order.orderId}
              className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-gray-900">#{order.orderId}</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {order.orderStatus}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <p className="text-xs text-gray-600 truncate">
                  {order.items.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    {order.deliveryAddress.area}, Kothagudem
                  </span>
                  <span>•</span>
                  <span>{order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Online Paid'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-gray-400 block">Total Amount</span>
                  <span className="text-base font-extrabold text-emerald-800">₹{order.totalAmount}</span>
                </div>

                <Link
                  to={`/track/${order.orderId}`}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
