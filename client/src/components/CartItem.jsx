import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex gap-4 bg-white rounded-xl p-4 shadow-sm">
      <img
        src={item.imageUrl}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-coffee-800 truncate">{item.name}</h3>
        <p className="text-sm text-coffee-400">{item.weight}</p>
        <p className="font-bold text-coffee-700 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeFromCart(item.productId)}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <FiTrash2 size={16} />
        </button>
        <div className="flex items-center gap-2 bg-coffee-50 rounded-lg">
          <button
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1.5 text-coffee-600 hover:bg-coffee-100 rounded-l-lg disabled:opacity-40"
          >
            <FiMinus size={14} />
          </button>
          <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="p-1.5 text-coffee-600 hover:bg-coffee-100 rounded-r-lg"
          >
            <FiPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
