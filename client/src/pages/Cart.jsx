import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { items, subtotal, deliveryFee, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-coffee-300 mb-4" size={64} />
        <h2 className="font-display text-2xl font-bold text-coffee-800 mb-2">Your cart is empty</h2>
        <p className="text-coffee-500 mb-6">Looks like you haven't added any coffee yet.</p>
        <Link
          to="/products"
          className="inline-block bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-coffee-800 mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 h-fit lg:sticky lg:top-20">
          <h2 className="font-semibold text-coffee-800 text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-coffee-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-coffee-600">
              <span>Delivery</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-coffee-400">Free delivery on orders above ₹500</p>
            )}
            <hr className="border-coffee-100" />
            <div className="flex justify-between font-bold text-coffee-800 text-base">
              <span>Total <span className="text-xs font-normal text-coffee-400">(incl. GST)</span></span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block text-center bg-coffee-600 hover:bg-coffee-700 text-white mt-6 min-h-[44px] py-3 rounded-xl font-semibold transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/products"
            className="block text-center text-coffee-500 hover:text-coffee-700 mt-3 text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
