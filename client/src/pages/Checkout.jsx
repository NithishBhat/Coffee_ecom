import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const EMAIL_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yahu.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'outlool.com': 'outlook.com',
  'hotmal.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'redifmail.com': 'rediffmail.com',
  'reddifmail.com': 'rediffmail.com',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [emailWarning, setEmailWarning] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    street: '', city: '', state: '', pincode: '',
  });

  const checkEmailTypo = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && EMAIL_TYPOS[domain]) {
      setEmailWarning(`Did you mean ${email.split('@')[0]}@${EMAIL_TYPOS[domain]}?`);
    } else {
      setEmailWarning('');
    }
  };

  const update = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'email') {
      checkEmailTypo(value);
    }
  };

  const fixEmail = () => {
    const domain = form.email.split('@')[1]?.toLowerCase();
    const corrected = EMAIL_TYPOS[domain];
    if (corrected) {
      const fixed = form.email.split('@')[0] + '@' + corrected;
      setForm({ ...form, email: fixed });
      setEmailWarning('');
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Valid email required';
    if (!/^\d{10}$/.test(form.phone)) return '10-digit phone number required';
    if (!form.street.trim()) return 'Full address is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) return '6-digit pincode required';
    return null;
  };

  const handlePay = async () => {
    const error = validate();
    if (error) return toast.error(error);
    if (items.length === 0) return toast.error('Cart is empty');

    setLoading(true);
    try {
      const { data } = await api.post('/orders/create', {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Brew Haven',
        description: 'Coffee Bean Order',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/orders/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId,
            });
            localStorage.setItem('customerPhone', form.phone);
            navigate(`/order/${data.orderId}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#6F4E37' },
        modal: {
          ondismiss: () => toast.error('Payment cancelled'),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => toast.error('Payment failed. Please try again.'));
      rzp.open();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-coffee-200 bg-white focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent text-sm';
  const selectClass = `${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236F4E37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-coffee-800 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-coffee-800 text-lg mb-4">Contact Details</h2>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="name" value={form.name} onChange={update} placeholder="Full Name" className={inputClass} />
                <div>
                  <input name="email" value={form.email} onChange={update} placeholder="Email" type="email" className={inputClass} />
                  {emailWarning && (
                    <button type="button" onClick={fixEmail} className="mt-1.5 text-xs text-amber-600 hover:text-amber-800 transition-colors">
                      {emailWarning} <span className="underline font-semibold">Click to fix</span>
                    </button>
                  )}
                </div>
              </div>
              <input name="phone" value={form.phone} onChange={update} placeholder="Phone (10 digits)" className={inputClass} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-coffee-800 text-lg mb-4">Delivery Address</h2>
            <div className="flex flex-col gap-4">
              <input name="street" value={form.street} onChange={update} placeholder="House No 12, 3rd Cross, Near Temple" className={inputClass} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="pincode" value={form.pincode} onChange={update} placeholder="Pincode (6 digits)" maxLength={6} inputMode="numeric" pattern="\d{6}" className={inputClass} />
                <input name="city" value={form.city} onChange={update} placeholder="City" className={inputClass} />
              </div>
              <select name="state" value={form.state} onChange={update} className={selectClass} style={{ maxHeight: '48px' }}>
                <option value="">Select State / Union Territory</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-20">
          <h2 className="font-semibold text-coffee-800 text-lg mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm text-coffee-600">
                <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                <span className="flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <hr className="border-coffee-100 my-3" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-coffee-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-coffee-600">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${deliveryFee}`}</span>
            </div>
            <hr className="border-coffee-100" />
            <div className="flex justify-between font-bold text-coffee-800 text-base">
              <span>Total <span className="text-xs font-normal text-coffee-400">(incl. GST)</span></span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-coffee-600 hover:bg-coffee-700 disabled:bg-coffee-300 text-white mt-6 py-3 rounded-xl font-semibold transition-colors"
          >
            {loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
