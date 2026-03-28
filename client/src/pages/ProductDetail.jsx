import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const roastColors = {
  light: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  dark: 'bg-coffee-700 text-coffee-100',
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-coffee-100 rounded-2xl" />
          <div className="space-y-4 py-4">
            <div className="h-6 bg-coffee-100 rounded w-1/4" />
            <div className="h-8 bg-coffee-100 rounded w-3/4" />
            <div className="h-4 bg-coffee-100 rounded w-full" />
            <div className="h-4 bg-coffee-100 rounded w-2/3" />
            <div className="h-10 bg-coffee-100 rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-coffee-800 mb-4">Product Not Found</h2>
        <Link to="/products" className="text-coffee-600 underline">Browse products</Link>
      </div>
    );
  }

  const outOfStock = product.stockQuantity <= 0;

  const handleAdd = () => {
    addToCart(product, quantity);
    toast.success(`${quantity}x ${product.name} added to cart`);
    setQuantity(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1 text-coffee-500 hover:text-coffee-700 mb-6 transition-colors">
        <FiArrowLeft /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-coffee-100 shadow-lg">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="py-2">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${roastColors[product.roastType]}`}>
              {product.roastType} roast
            </span>
            <span className="text-sm text-coffee-400">{product.weight}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-800 mb-2">{product.name}</h1>
          <p className="text-coffee-400 mb-4">Origin: {product.origin}</p>
          <p className="text-2xl font-bold text-coffee-700 mb-6">₹{product.price.toLocaleString('en-IN')}</p>

          <p className="text-coffee-600 leading-relaxed mb-8">{product.description}</p>

          {outOfStock ? (
            <div className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-semibold text-center">
              Out of Stock
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center bg-white border border-coffee-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 hover:bg-coffee-50 transition-colors"
                >
                  <FiMinus />
                </button>
                <span className="px-5 font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="p-3 hover:bg-coffee-50 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto"
              >
                Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}
              </button>
            </div>
          )}

          {!outOfStock && (
            <p className="text-xs text-coffee-400 mt-3">{product.stockQuantity} in stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
