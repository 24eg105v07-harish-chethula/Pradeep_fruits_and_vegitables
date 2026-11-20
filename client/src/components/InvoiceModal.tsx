import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Order } from '../types/index.ts';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp max-h-[90vh] flex flex-col justify-between">
        {/* Controls */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800 text-sm">Tax Invoice: #{order.orderId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-8 overflow-y-auto font-sans text-gray-800 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥦</span>
                <h1 className="text-xl font-black text-emerald-950 uppercase tracking-tight">
                  PRADEEP FRUITS AND VEGETABLES
                </h1>
              </div>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Main Market Road, Bhadradri Kothagudem, Telangana, India - 507101
              </p>
              <p className="text-xs text-gray-500">
                Phone: +91 97045 32104 | FSSAI / Retail Trade License: PFV-TS-2026
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider mb-1">
                Tax Invoice
              </span>
              <p className="text-sm font-extrabold text-gray-900">#{order.orderId}</p>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Billed To / Shipping Address */}
          <div className="grid grid-cols-2 gap-6 text-xs bg-gray-50/70 p-4 rounded-xl border border-gray-100">
            <div>
              <h4 className="font-extrabold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                Customer Details
              </h4>
              <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-600 font-medium">Mobile: +91 {order.customerPhone}</p>
              {order.customerEmail && <p className="text-gray-600">Email: {order.customerEmail}</p>}
            </div>
            <div>
              <h4 className="font-extrabold text-gray-500 uppercase tracking-wider text-[10px] mb-1">
                Delivery Location
              </h4>
              <p className="font-semibold text-gray-800">
                {order.deliveryAddress.houseNo}, {order.deliveryAddress.street}
              </p>
              <p className="text-gray-600">
                {order.deliveryAddress.area}, {order.deliveryAddress.town || 'Kothagudem'}
              </p>
              <p className="text-gray-600 font-medium">
                {order.deliveryAddress.district}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-gray-500 italic mt-0.5">Landmark: {order.deliveryAddress.landmark}</p>
              )}
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      {item.name}
                      {item.teluguName && <span className="text-gray-500 ml-1 font-normal">({item.teluguName})</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-600">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-900">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right text-gray-600">₹{item.price}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Info */}
          <div className="flex justify-between items-start pt-2">
            <div className="text-xs space-y-1 max-w-xs">
              <p className="font-bold text-gray-700">Payment Information:</p>
              <p className="text-gray-600">
                Method: <strong>{order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Razorpay Online Payment'}</strong>
              </p>
              <p className="text-gray-600 flex items-center gap-1">
                Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
              </p>
              {order.deliveryInstructions && (
                <p className="text-gray-500 italic mt-2">
                  Instructions: "{order.deliveryInstructions}"
                </p>
              )}
            </div>

            <div className="w-64 space-y-1.5 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges:</span>
                <span className="font-semibold text-gray-900">
                  {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
                </span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon ({order.couponCode}):</span>
                  <span>-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-gray-900">
                <span>Total Amount:</span>
                <span className="text-emerald-800 text-base">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer declaration */}
          <div className="border-t border-gray-100 pt-4 text-center text-[10px] text-gray-400">
            <p>Thank you for shopping with PRADEEP FRUITS AND VEGETABLES, Bhadradri Kothagudem.</p>
            <p>This is a computer-generated tax invoice. Handpicked fresh daily!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
