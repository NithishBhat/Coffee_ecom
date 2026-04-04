import { useState, useEffect } from 'react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const FILTERS = ['all', 'light', 'medium', 'dark'];
const SORT_OPTIONS = [
  { value: 'default', label: 'Sort by' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');

  useEffect(() => {
    setLoading(true);
    const params = filter !== 'all' ? { roastType: filter } : {};
    api.get('/products', { params })
      .then((res) => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-coffee-800 mb-2">Our Coffee</h1>
      <p className="text-coffee-500 mb-6">Browse our selection of premium Indian coffee beans</p>

      {/* Filter & Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-coffee-600 text-white'
                : 'bg-white text-coffee-600 border border-coffee-200 hover:bg-coffee-100'
            }`}
          >
            {f === 'all' ? 'All Roasts' : `${f} Roast`}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto px-4 py-2 rounded-full text-sm font-medium border border-coffee-200 bg-white text-coffee-600 focus:outline-none focus:ring-2 focus:ring-coffee-400"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-square bg-coffee-100" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-coffee-100 rounded w-1/3" />
                <div className="h-5 bg-coffee-100 rounded w-2/3" />
                <div className="h-4 bg-coffee-100 rounded w-full" />
                <div className="h-10 bg-coffee-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-coffee-400 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...products]
            .sort((a, b) => {
              if (sort === 'price-asc') return a.price - b.price;
              if (sort === 'price-desc') return b.price - a.price;
              if (sort === 'name-asc') return a.name.localeCompare(b.name);
              return 0;
            })
            .map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
        </div>
      )}
    </div>
  );
}
