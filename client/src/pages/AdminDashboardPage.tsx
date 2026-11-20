import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Tag,
  Printer,
  Phone,
  MessageCircle,
  Zap,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext.tsx';
import api from '../services/api.ts';
import { getSocket } from '../services/socket.ts';
import { Order, OrderStatus, Product, ServiceArea, Coupon, AdminStats } from '../types/index.ts';
import { InvoiceModal } from '../components/InvoiceModal.tsx';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, isAdminAuthenticated, adminLogout } = useAuthContext();

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'areas' | 'coupons'>('orders');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Filters & State
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    teluguName: '',
    category: 'Fresh Vegetables',
    description: '',
    price: 30,
    originalPrice: 40,
    unit: '1kg' as any,
    availableStock: 25,
    images: ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'],
    isDailyOffer: false,
    isBestSeller: false,
    isFeatured: false
  });

  // New Service Area Modal State
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
  const [newArea, setNewArea] = useState({
    areaName: '',
    town: 'Kothagudem',
    pincode: '507101',
    baseDeliveryMinutes: 30,
    minimumOrder: 99,
    deliveryCharge: 20,
    freeDeliveryThreshold: 299
  });

  // New Coupon Modal State
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountPercentage: 20,
    minOrderValue: 199,
    maxDiscountAmount: 50,
    validUntil: '2028-12-31'
  });

  // Verify Admin Auth
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
      return;
    }

    fetchAllAdminData();

    // Setup Socket.IO for real-time notifications
    const socket = getSocket();
    socket.emit('join_admin_room');

    socket.on('new_order', (data: any) => {
      setNewOrderAlert(`🚨 New Order Placed! #${data.order?.orderId} - ₹${data.order?.totalAmount}`);
      fetchAllAdminData();
      try {
        // Play simple notification chime
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    });

    socket.on('order_updated', () => {
      fetchAllAdminData();
    });

    // Poll as a reliable fallback in case WebSocket delivery is unavailable
    const orderRefreshInterval = window.setInterval(() => {
      fetchAllAdminData();
    }, 10000);

    return () => {
      window.clearInterval(orderRefreshInterval);
      socket.off('new_order');
      socket.off('order_updated');
    };
  }, [isAdminAuthenticated]);

  const fetchAllAdminData = async () => {
    try {
      setIsLoading(true);

      const ordersRes = await api.get('/admin/orders');
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);

      const [statsRes, productsRes, areasRes, couponsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products'),
        api.get('/service-areas'),
        api.get('/coupons')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (productsRes.data.success) setProducts(productsRes.data.products);
      if (areasRes.data.success) setServiceAreas(areasRes.data.areas);
      if (couponsRes.data.success) setCoupons(couponsRes.data.coupons);
    } catch (err: any) {
      console.warn('Error fetching admin data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, customEstTime?: number) => {
    try {
      const payload: any = { status };
      if (customEstTime !== undefined) {
        payload.estimatedDeliveryTime = customEstTime;
      }
      const res = await api.put(`/admin/orders/${orderId}/status`, payload);
      if (res.data.success) {
        fetchAllAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleAdjustDeliveryTime = async (orderId: string, minutes: number) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { estimatedDeliveryTime: minutes });
      if (res.data.success) {
        fetchAllAdminData();
      }
    } catch (err: any) {
      alert('Failed to update delivery estimate');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', newProduct);
      if (res.data.success) {
        setIsAddProductOpen(false);
        fetchAllAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating product');
    }
  };

  const handleQuickStockUpdate = async (productId: string, newStock: number) => {
    try {
      await api.patch(`/products/${productId}/stock`, { availableStock: newStock });
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/service-areas', newArea);
      if (res.data.success) {
        setIsAddAreaOpen(false);
        fetchAllAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating area');
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!window.confirm('Delete this service zone?')) return;
    try {
      await api.delete(`/service-areas/${id}`);
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to delete service zone');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/coupons', newCoupon);
      if (res.data.success) {
        setIsAddCouponOpen(false);
        fetchAllAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Remove this promotional coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchAllAdminData();
    } catch (err) {
      alert('Failed to remove coupon');
    }
  };

  const openWhatsApp = (order: Order) => {
    const phone = order.customerPhone.replace(/\D/g, '').slice(-10);
    const msg = `Hello ${order.customerName},\nYour order *${order.orderId}* with *PRADEEP FRUITS AND VEGETABLES* has been updated!\n\nStatus: *${order.orderStatus}*\nEstimated Delivery: *${order.estimatedDeliveryTime} mins*\nTotal: ₹${order.totalAmount}\nDelivery Area: ${order.deliveryAddress.area}, Bhadradri Kothagudem.\n\nThank you for choosing fresh & healthy produce!`;
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      !orderSearchQuery ||
      o.orderId.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customerPhone.includes(orderSearchQuery) ||
      o.deliveryAddress.area.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white border-b border-emerald-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                🥦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg text-white">
                    PRADEEP FRUITS AND VEGETABLES
                  </h1>
                  <span className="bg-emerald-700 text-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Admin Portal
                  </span>
                </div>
                <p className="text-xs text-emerald-300 font-medium">
                  Store Operations & Direct Delivery Management • Bhadradri Kothagudem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={fetchAllAdminData}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Refresh latest data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-emerald-200">{admin?.name || 'Store Manager'}</span>
                <button
                  onClick={() => {
                    adminLogout();
                    navigate('/admin/login');
                  }}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Order Alert Toast */}
      {newOrderAlert && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Statistics Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-gray-400">Total Orders</div>
              <div className="text-xl font-black text-gray-900 mt-1">{stats.totalOrders}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-600">Today's Orders</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{stats.todayOrders}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-amber-600">Pending Active</div>
              <div className="text-xl font-black text-amber-600 mt-1">{stats.pendingOrders}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-800">Completed</div>
              <div className="text-xl font-black text-emerald-800 mt-1">{stats.completedOrders}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-red-500">Cancelled</div>
              <div className="text-xl font-black text-red-600 mt-1">{stats.cancelledOrders}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-blue-600">Customers</div>
              <div className="text-xl font-black text-blue-700 mt-1">{stats.totalCustomers}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Total Revenue</div>
              <div className="text-xl font-black text-emerald-900 mt-1">₹{stats.totalRevenue}</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-[10px] uppercase font-bold text-orange-600">Low Stock</div>
              <div className="text-xl font-black text-orange-600 mt-1">{stats.lowStockCount}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'orders'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & Delivery Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'products'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Produce & Stock Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('areas')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'areas'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Service Areas & Pincodes ({serviceAreas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'coupons'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Promotional Coupons ({coupons.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDERS & DIRECT DELIVERY MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Search and Status Filters */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search Order ID, Customer, Phone, Area..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                {[
                  'all',
                  'Order Placed',
                  'Order Confirmed',
                  'Preparing',
                  'Packed',
                  'Out for Delivery',
                  'Delivered',
                  'Cancelled'
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                      orderStatusFilter === st
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed Cards */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500 text-sm font-semibold">No matching customer orders found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  return (
                    <div
                      key={order._id || order.orderId}
                      className="bg-white rounded-3xl border border-gray-200 hover:border-emerald-300 shadow-sm p-6 space-y-4 transition-all"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-gray-900">
                            #{order.orderId}
                          </span>
                          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        {/* Top quick action tools */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openWhatsApp(order)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                            title="Send WhatsApp update to customer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        {/* Column 1: Customer & Delivery Address */}
                        <div className="space-y-1.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                          <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                            Customer & Delivery Location
                          </div>
                          <p className="font-extrabold text-gray-900 text-sm">
                            {order.customerName}
                          </p>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>+91 {order.customerPhone}</span>
                          </a>
                          {order.customerEmail && (
                            <p className="text-gray-600 break-all">Email: {order.customerEmail}</p>
                          )}
                          <p className="text-gray-600 mt-1">
                            {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}
                          </p>
                          <p className="text-gray-700 font-semibold">
                            {order.deliveryAddress.area}, {order.deliveryAddress.town || 'Kothagudem'}
                          </p>
                          <p className="text-gray-600">
                            {order.deliveryAddress.district || 'Bhadradri Kothagudem'}, {order.deliveryAddress.state || 'Telangana'} - {order.deliveryAddress.pincode}
                          </p>
                          {order.deliveryInstructions && (
                            <p className="text-gray-600 italic">Instructions: {order.deliveryInstructions}</p>
                          )}
                        </div>

                        {/* Column 2: Items Ordered */}
                        <div className="space-y-1.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                          <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider flex justify-between">
                            <span>Ordered Items ({order.items.length})</span>
                            <span className="text-gray-800 font-bold">Total: ₹{order.totalAmount}</span>
                          </div>

                          <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg border border-gray-200 shrink-0" />
                                  )}
                                  <span className="font-medium text-gray-800 truncate max-w-[145px]">
                                    {item.name} ({item.unit})
                                  </span>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-gray-900">₹{item.price} × {item.quantity}</p>
                                  <p className="text-[10px] text-gray-500">Subtotal ₹{item.totalPrice}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-gray-200 flex justify-between text-[11px] text-gray-600">
                            <span>Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})</span>
                            {order.couponCode && <span className="text-emerald-700 font-bold">Coupon: {order.couponCode}</span>}
                          </div>
                        </div>

                        {/* Column 3: Delivery Management Controls */}
                        <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                          <div className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Delivery Controls</span>
                            </span>
                            <span className="font-extrabold text-emerald-800">
                              ~{order.estimatedDeliveryTime} mins
                            </span>
                          </div>

                          {/* Quick delivery time adjuster */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-gray-600">Adjust Est:</span>
                            <button
                              onClick={() => handleAdjustDeliveryTime(order.orderId, Math.max(15, order.estimatedDeliveryTime - 5))}
                              className="px-2 py-0.5 bg-white border border-gray-200 rounded font-bold hover:bg-gray-100"
                            >
                              -5m
                            </button>
                            <button
                              onClick={() => handleAdjustDeliveryTime(order.orderId, order.estimatedDeliveryTime + 5)}
                              className="px-2 py-0.5 bg-white border border-gray-200 rounded font-bold hover:bg-gray-100"
                            >
                              +5m
                            </button>
                            <button
                              onClick={() => handleAdjustDeliveryTime(order.orderId, order.estimatedDeliveryTime + 10)}
                              className="px-2 py-0.5 bg-white border border-gray-200 rounded font-bold hover:bg-gray-100"
                            >
                              +10m
                            </button>
                          </div>

                          {/* Order Lifecycle Status Buttons */}
                          <div className="pt-2 flex flex-wrap gap-1.5">
                            {order.orderStatus === 'Order Placed' && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId, 'Order Confirmed')}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm"
                                >
                                  Accept Order
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId, 'Cancelled')}
                                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold"
                                >
                                  Reject Order
                                </button>
                              </>
                            )}

                            {order.orderStatus === 'Order Confirmed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'Preparing')}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm"
                              >
                                Start Weighing & Packing
                              </button>
                            )}

                            {order.orderStatus === 'Preparing' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'Packed')}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                              >
                                Mark as Packed
                              </button>
                            )}

                            {order.orderStatus === 'Packed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'Out for Delivery')}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                              >
                                Dispatch for 30-Min Delivery
                              </button>
                            )}

                            {order.orderStatus === 'Out for Delivery' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'Delivered')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                              >
                                Mark Delivered (Collect Payment)
                              </button>
                            )}

                            {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.orderId, 'Cancelled')}
                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded font-semibold text-[10px]"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCE & STOCK INVENTORY */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Tags</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products
                      .filter(p => !productSearchQuery || p.name.toLowerCase().includes(productSearchQuery.toLowerCase()))
                      .map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center gap-2.5">
                            <img
                              src={p.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200"
                            />
                            <div>
                              <p className="font-bold text-gray-900">{p.name}</p>
                              {p.teluguName && <p className="text-[10px] text-gray-500">{p.teluguName}</p>}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-700">{p.category}</td>
                          <td className="py-3 px-4 text-gray-600">{p.unit}</td>
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-gray-900">₹{p.price}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-gray-400 line-through text-[10px] ml-1">₹{p.originalPrice}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickStockUpdate(p._id, Math.max(0, p.availableStock - 1))}
                                className="w-5 h-5 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center text-xs"
                              >
                                -
                              </button>
                              <span className={`font-bold min-w-[24px] text-center ${
                                p.availableStock <= 5 ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {p.availableStock}
                              </span>
                              <button
                                onClick={() => handleQuickStockUpdate(p._id, p.availableStock + 1)}
                                className="w-5 h-5 rounded bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 flex items-center justify-center text-xs"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 flex-wrap">
                              {p.isDailyOffer && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Daily</span>}
                              {p.isBestSeller && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Bestseller</span>}
                              {p.isFeatured && <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-1.5 py-0.2 rounded">Featured</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE AREAS & PINCODES */}
        {activeTab === 'areas' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Bhadradri Kothagudem Service Areas
                </h3>
                <p className="text-xs text-gray-500">
                  Only orders with addresses in enabled zones will be accepted.
                </p>
              </div>

              <button
                onClick={() => setIsAddAreaOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service Area</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreas.map((area) => (
                <div
                  key={area._id || area.areaName}
                  className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{area.areaName}</h4>
                      <p className="text-xs text-gray-500">{area.town}, Bhadradri Kothagudem</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-0.5 rounded-full">
                      {area.pincode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Est Delivery:</span>
                      <span className="font-bold text-gray-900">~{area.estimatedMinutes || 30} mins</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Delivery Fee:</span>
                      <span className="font-bold text-gray-900">₹{area.deliveryCharge}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Min Order:</span>
                      <span className="font-bold text-gray-900">₹{area.minimumOrder}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Free Above:</span>
                      <span className="font-bold text-emerald-700">₹{area.freeDeliveryThreshold}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleDeleteArea(area._id || '')}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Delete Zone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROMOTIONAL COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">
                  Promotional Coupons & Discounts
                </h3>
                <p className="text-xs text-gray-500">
                  Create discount codes for customer carts and checkout.
                </p>
              </div>

              <button
                onClick={() => setIsAddCouponOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id || coupon.code}
                  className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {coupon.discountPercentage}% OFF
                    </span>
                  </div>

                  <p className="text-xs text-gray-600">{coupon.description}</p>

                  <div className="text-[11px] text-gray-500 space-y-0.5 pt-1 border-t border-gray-100">
                    <p>Max Discount: <strong>₹{coupon.maxDiscountAmount}</strong></p>
                    <p>Min Order Value: <strong>₹{coupon.minOrderValue}</strong></p>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-xs text-red-600 hover:underline font-bold"
                    >
                      Delete Coupon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Add New Fresh Product
            </h3>
            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Name (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Fresh Cauliflower"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Regional Name (Telugu)</label>
                <input
                  type="text"
                  placeholder="e.g. క్యాలీఫ్లవర్"
                  value={newProduct.teluguName}
                  onChange={(e) => setNewProduct({ ...newProduct, teluguName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Fresh Vegetables">Fresh Vegetables</option>
                    <option value="Fresh Fruits">Fresh Fruits</option>
                    <option value="Leafy Vegetables">Leafy Vegetables</option>
                    <option value="Organic Vegetables">Organic Vegetables</option>
                    <option value="Seasonal Fruits">Seasonal Fruits</option>
                    <option value="Dry Fruits">Dry Fruits</option>
                    <option value="Daily Grocery Essentials">Daily Grocery Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Default Unit</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value as any })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="1kg">1kg</option>
                    <option value="500g">500g</option>
                    <option value="250g">250g</option>
                    <option value="1 piece">1 piece</option>
                    <option value="1 dozen">1 dozen</option>
                    <option value="1 bunch">1 bunch</option>
                    <option value="1 packet">1 packet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={newProduct.availableStock}
                    onChange={(e) => setNewProduct({ ...newProduct, availableStock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Product Image URL</label>
                <input
                  type="url"
                  value={newProduct.images[0]}
                  onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newProduct.isDailyOffer}
                    onChange={(e) => setNewProduct({ ...newProduct, isDailyOffer: e.target.checked })}
                  />
                  <span>Daily Offer</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={newProduct.isBestSeller}
                    onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })}
                  />
                  <span>Bestseller</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Area Modal */}
      {isAddAreaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Add Service Area (Bhadradri Kothagudem)
            </h3>
            <form onSubmit={handleCreateArea} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Area / Colony Name</label>
                <input
                  type="text"
                  placeholder="e.g. Laxmidevipally"
                  value={newArea.areaName}
                  onChange={(e) => setNewArea({ ...newArea, areaName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Town</label>
                  <input
                    type="text"
                    value={newArea.town}
                    onChange={(e) => setNewArea({ ...newArea, town: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newArea.pincode}
                    onChange={(e) => setNewArea({ ...newArea, pincode: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Est Mins</label>
                  <input
                    type="number"
                    value={newArea.baseDeliveryMinutes}
                    onChange={(e) => setNewArea({ ...newArea, baseDeliveryMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Delivery ₹</label>
                  <input
                    type="number"
                    value={newArea.deliveryCharge}
                    onChange={(e) => setNewArea({ ...newArea, deliveryCharge: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order ₹</label>
                  <input
                    type="number"
                    value={newArea.minimumOrder}
                    onChange={(e) => setNewArea({ ...newArea, minimumOrder: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAreaOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Service Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-extrabold text-base text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Create Promotional Coupon
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  placeholder="e.g. SPECIAL40"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% OFF on all vegetables"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newCoupon.discountPercentage}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max Disc ₹</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscountAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Order ₹</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
