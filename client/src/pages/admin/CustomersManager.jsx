import { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = (q) => {
    setLoading(true);
    api.get('/admin/customers', { params: q ? { search: q } : {} })
      .then((res) => setCustomers(res.data.customers))
      .catch(() => toast.error('Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="font-display text-xl font-bold text-coffee-800">Customers</h1>
        <span className="text-xs text-coffee-400 ml-auto">{customers.length} customer{customers.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
          />
        </div>
      </form>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-white rounded-lg h-14" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-coffee-400">No customers found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-coffee-50 text-coffee-600">
                <tr>
                  <th className="text-left p-3 font-semibold text-xs">Name</th>
                  <th className="text-left p-3 font-semibold text-xs hidden sm:table-cell">Phone</th>
                  <th className="text-left p-3 font-semibold text-xs hidden md:table-cell">Email</th>
                  <th className="text-center p-3 font-semibold text-xs">Orders</th>
                  <th className="text-right p-3 font-semibold text-xs">Total Spent</th>
                  <th className="text-right p-3 font-semibold text-xs hidden lg:table-cell">Last Order</th>
                  <th className="text-right p-3 font-semibold text-xs w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {customers.map((c) => (
                  <CustomerRow
                    key={c._id}
                    customer={c}
                    expanded={expanded === c._id}
                    onToggle={() => setExpanded(expanded === c._id ? null : c._id)}
                    fmt={fmt}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer: c, expanded, onToggle, fmt }) {
  return (
    <>
      <tr className="hover:bg-coffee-50/50 cursor-pointer" onClick={onToggle}>
        <td className="p-3 text-coffee-800 font-medium text-xs">{c.name}</td>
        <td className="p-3 text-coffee-500 text-xs hidden sm:table-cell">{c.phone}</td>
        <td className="p-3 text-coffee-500 text-xs hidden md:table-cell truncate max-w-[180px]">{c.email}</td>
        <td className="p-3 text-center text-coffee-700 font-semibold text-xs">{c.orderCount}</td>
        <td className="p-3 text-right text-coffee-700 font-semibold text-xs">{fmt(c.totalSpent)}</td>
        <td className="p-3 text-right text-coffee-400 text-xs hidden lg:table-cell">
          {new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td className="p-3 text-right text-coffee-400">
          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-coffee-50/30 px-3 py-3">
            <div className="sm:hidden text-xs text-coffee-500 mb-2">{c.phone} | {c.email}</div>
            <p className="text-xs font-semibold text-coffee-600 mb-2">Order History</p>
            <div className="space-y-1.5">
              {c.orders.map((o) => (
                <a
                  key={o.orderId}
                  href={`/admin/orders`}
                  className="flex flex-wrap items-center gap-2 text-xs bg-white rounded-lg px-3 py-2 hover:bg-coffee-50 transition-colors"
                >
                  <span className="font-semibold text-coffee-800">{o.orderId}</span>
                  <span className="text-coffee-400">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="font-semibold text-coffee-700">{fmt(o.totalAmount)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize leading-none ${STATUS_COLORS[o.fulfillmentStatus] || 'bg-gray-100 text-gray-600'}`}>
                    {o.fulfillmentStatus}
                  </span>
                </a>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
