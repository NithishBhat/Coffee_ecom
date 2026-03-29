import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EMPTY = {
  name: '', description: '', price: '', weight: '250g',
  roastType: 'medium', origin: '', imageUrl: '', stockQuantity: '',
  isActive: true,
};

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/admin/products')
      .then((res) => setProducts(res.data.products))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const openAdd = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (p) => {
    setForm({
      ...p,
      price: String(p.price),
      stockQuantity: String(p.stockQuantity),
    });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.imageUrl) {
      return toast.error('Name, price, and image URL are required');
    }
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) || 0 };
      if (modal === 'add') {
        await api.post('/admin/products', body);
        toast.success('Product added');
      } else {
        await api.put(`/admin/products/${form._id}`, body);
        toast.success('Product updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-coffee-200 focus:outline-none focus:ring-2 focus:ring-coffee-400 text-sm';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-coffee-800">Products</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <FiPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-20" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-coffee-50 text-coffee-600">
                <tr>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4 hidden sm:table-cell">Roast</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4 hidden md:table-cell">Stock</th>
                  <th className="text-left p-4 hidden md:table-cell">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-50">
                {products.map((p) => (
                  <tr key={p._id} className={p.stockQuantity <= (p.lowStockThreshold ?? 10) ? 'bg-orange-50 hover:bg-orange-100/70' : 'hover:bg-coffee-50/50'}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="font-medium text-coffee-800 truncate max-w-[150px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 capitalize hidden sm:table-cell text-coffee-500">{p.roastType}</td>
                    <td className="p-4 text-coffee-700 font-semibold">₹{p.price}</td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={p.stockQuantity <= (p.lowStockThreshold ?? 10) ? 'text-orange-600 font-bold' : p.stockQuantity > 0 ? 'text-green-600' : 'text-red-500'}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openEdit(p)} className="text-coffee-500 hover:text-coffee-700 p-1"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(p._id, p.name)} className="text-red-400 hover:text-red-600 p-1 ml-2"><FiTrash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <p className="text-center text-coffee-400 py-8">No products yet. Add your first product!</p>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-coffee-800 text-lg">
                {modal === 'add' ? 'Add Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setModal(null)} className="text-coffee-400 hover:text-coffee-600"><FiX size={20} /></button>
            </div>
            <div className="space-y-3">
              <input name="name" value={form.name} onChange={update} placeholder="Product Name" className={inputClass} />
              <textarea name="description" value={form.description} onChange={update} placeholder="Description" rows={3} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input name="price" value={form.price} onChange={update} placeholder="Selling Price (₹, incl. GST)" type="number" className={inputClass} />
                  {Number(form.price) > 0 && (() => {
                    const selling = Number(form.price);
                    const base = (selling / 1.05).toFixed(2);
                    const gst = (selling - base).toFixed(2);
                    return (
                      <div className="mt-1.5 bg-coffee-50 rounded-lg px-3 py-2 text-xs text-coffee-600 space-y-0.5">
                        <div className="flex justify-between">
                          <span>Base Price</span>
                          <span>₹{base}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST @ 5%</span>
                          <span>₹{gst}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-coffee-800 pt-0.5 border-t border-coffee-200">
                          <span>Customer pays</span>
                          <span>₹{selling.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <input name="weight" value={form.weight} onChange={update} placeholder="Weight (e.g. 250g)" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="roastType" value={form.roastType} onChange={update} className={inputClass}>
                  <option value="light">Light Roast</option>
                  <option value="medium">Medium Roast</option>
                  <option value="dark">Dark Roast</option>
                </select>
                <input name="origin" value={form.origin} onChange={update} placeholder="Origin" className={inputClass} />
              </div>
              <input name="imageUrl" value={form.imageUrl} onChange={update} placeholder="Image URL" className={inputClass} />
              <input name="stockQuantity" value={form.stockQuantity} onChange={update} placeholder="Stock Quantity" type="number" className={inputClass} />
              <label className="flex items-center gap-2 text-sm text-coffee-600">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={update} className="rounded" />
                Active (visible on storefront)
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-coffee-200 text-coffee-600 hover:bg-coffee-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 text-white font-medium transition-colors">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
