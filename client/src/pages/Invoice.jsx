import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';

const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function Invoice() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || localStorage.getItem('customerPhone') || '';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!phone) { setError('Phone number required'); setLoading(false); return; }
    api.get(`/orders/${id}/invoice`, { params: { phone } })
      .then((res) => setOrder(res.data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, phone]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-coffee-400">Loading invoice...</div>;
  }
  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-coffee-500 mb-4">{error || 'Invoice not found'}</p>
        <Link to="/track" className="text-coffee-600 underline">Track your order</Link>
      </div>
    );
  }

  const gst = order.gstBreakdown;
  const invoiceDate = new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Print button */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Download / Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-0" id="invoice">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-coffee-200">
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">Brew Haven</h1>
            <p className="text-xs text-coffee-400 mt-1">GSTIN: XXXXXXXXXXXX</p>
            <p className="text-xs text-coffee-400">Karnataka, India</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-coffee-800">TAX INVOICE</h2>
            <p className="text-xs text-coffee-500 mt-1">Invoice #: {order.orderId}</p>
            <p className="text-xs text-coffee-500">Date: {invoiceDate}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-coffee-400 uppercase tracking-wide mb-2">Bill To</h3>
          <p className="text-sm text-coffee-800 font-semibold">{order.customer.name}</p>
          <p className="text-xs text-coffee-500">{order.customer.address.street}</p>
          <p className="text-xs text-coffee-500">
            {order.customer.address.city}, {order.customer.address.state} — {order.customer.address.pincode}
          </p>
          <p className="text-xs text-coffee-500">Phone: {order.customer.phone} | Email: {order.customer.email}</p>
          {gst && <p className="text-xs text-coffee-400 mt-1">Place of Supply: {gst.customerState}</p>}
        </div>

        {/* Items table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-coffee-50 text-coffee-600">
                <th className="text-left p-2.5 font-semibold">Item</th>
                <th className="text-center p-2.5 font-semibold">HSN</th>
                <th className="text-center p-2.5 font-semibold">Qty</th>
                <th className="text-right p-2.5 font-semibold">Unit Price</th>
                <th className="text-right p-2.5 font-semibold">Taxable</th>
                {gst && !gst.isInterState ? (
                  <>
                    <th className="text-right p-2.5 font-semibold">CGST 2.5%</th>
                    <th className="text-right p-2.5 font-semibold">SGST 2.5%</th>
                  </>
                ) : (
                  <th className="text-right p-2.5 font-semibold">IGST 5%</th>
                )}
                <th className="text-right p-2.5 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => {
                const lineTotal = item.price * item.quantity;
                const lineBase = Math.round((lineTotal / 1.05) * 100) / 100;
                const lineGst = Math.round((lineTotal - lineBase) * 100) / 100;
                const unitBase = Math.round((item.price / 1.05) * 100) / 100;
                return (
                  <tr key={i} className="border-b border-coffee-100">
                    <td className="p-2.5 text-coffee-800">{item.name} ({item.weight})</td>
                    <td className="p-2.5 text-center text-coffee-500">0901</td>
                    <td className="p-2.5 text-center text-coffee-500">{item.quantity}</td>
                    <td className="p-2.5 text-right text-coffee-500">{fmt(unitBase)}</td>
                    <td className="p-2.5 text-right text-coffee-500">{fmt(lineBase)}</td>
                    {gst && !gst.isInterState ? (
                      <>
                        <td className="p-2.5 text-right text-coffee-500">{fmt(Math.round((lineGst / 2) * 100) / 100)}</td>
                        <td className="p-2.5 text-right text-coffee-500">{fmt(Math.round((lineGst / 2) * 100) / 100)}</td>
                      </>
                    ) : (
                      <td className="p-2.5 text-right text-coffee-500">{fmt(lineGst)}</td>
                    )}
                    <td className="p-2.5 text-right font-semibold text-coffee-800">{fmt(lineTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="flex justify-between text-xs text-coffee-500 py-1.5">
              <span>Taxable Amount</span>
              <span>{fmt(gst?.basePrice || order.subtotal)}</span>
            </div>
            {gst && !gst.isInterState ? (
              <>
                <div className="flex justify-between text-xs text-coffee-500 py-1.5">
                  <span>CGST @ 2.5%</span>
                  <span>{fmt(gst.cgst)}</span>
                </div>
                <div className="flex justify-between text-xs text-coffee-500 py-1.5">
                  <span>SGST @ 2.5%</span>
                  <span>{fmt(gst.sgst)}</span>
                </div>
              </>
            ) : gst ? (
              <div className="flex justify-between text-xs text-coffee-500 py-1.5">
                <span>IGST @ 5%</span>
                <span>{fmt(gst.igst)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-xs text-coffee-500 py-1.5">
              <span>Subtotal (incl. GST)</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-coffee-500 py-1.5">
              <span>Delivery</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : fmt(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-coffee-800 py-2 border-t-2 border-coffee-200 mt-1">
              <span>Grand Total</span>
              <span>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-coffee-100 pt-4 text-center">
          <p className="text-[10px] text-coffee-400">This is a computer generated invoice and does not require a signature.</p>
          <p className="text-[10px] text-coffee-400 mt-1">HSN Code: 0901 — Coffee (not roasted, not decaffeinated) | GST Rate: 5%</p>
        </div>
      </div>
    </div>
  );
}
