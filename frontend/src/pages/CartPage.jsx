import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContextContext';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { applyCoupon } from '../api/couponApi';

export default function CartPage() {
  const navigate = useNavigate();
  // Assuming your StoreContext provides these. Adjust names if yours are slightly different!
  const { user, cartItems = [], removeFromCart, addToCart, discount, appliedCoupon, setAppliedCoupon } = useContext(StoreContext);

  // --- COUPON STATE ---
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // --- MATH & TOTALS ---
  // 1. Calculate subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * (item.qty || 1), 0);
  
  // 2. Calculate discount amount in dollars
  const discountAmount = (subtotal * discount) / 100;
  
  // 3. Final total
  const finalTotal = subtotal - discountAmount;

  // --- COUPON HANDLER ---
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    
    setIsApplying(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const data = await applyCoupon(couponCode);
      setAppliedCoupon({ code: data.code, discountPercentage: data.discountPercentage });
      setCouponSuccess(`Success! ${data.discountPercentage}% discount applied.`);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error.message || 'Error applying coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const checkoutHandler = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-2xl p-12 flex flex-col items-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-brand-600/10 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-brand-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-100 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added any tech gear to your cart yet.</p>
          <Link to="/" className="btn-gradient text-white px-8 py-3 inline-flex items-center gap-2">
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-extrabold text-gray-100 mb-8 animate-fade-in">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {cartItems.map((item, index) => (
            <div 
              key={item._id} 
              className="flex flex-col sm:flex-row items-center glass p-5 rounded-2xl gap-5 hover:bg-white/[0.06] transition-all duration-300 fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-white/5" />
              
              <div className="flex-1 text-center sm:text-left">
                <Link to={`/product/${item._id}`} className="text-base font-bold text-gray-100 hover:text-brand-400 line-clamp-1 transition-colors">
                  {item.name}
                </Link>
                <div className="text-brand-400 font-bold mt-1">৳{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                <select
                  value={item.qty || 1}
                  onChange={(e) => addToCart({ ...item, qty: Number(e.target.value) })}
                  className="bg-transparent font-medium text-gray-300 outline-none p-2 cursor-pointer"
                >
                  {[...Array(item.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1} className="bg-gray-900">
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remove Button */}
              <button 
                onClick={() => removeFromCart(item._id)}
                className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                title="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass-strong rounded-2xl p-7 sticky top-24">
            <h2 className="text-xl font-bold text-gray-100 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, item) => acc + (item.qty || 1), 0)} items)</span>
                <span className="font-medium text-gray-200">৳{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {/* Discount Row (Only shows if coupon applied) */}
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-medium animate-fade-in">
                  <span>Discount ({discount}%)</span>
                  <span>-৳{discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            <hr className="border-white/10 mb-6" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-100">Total</span>
              <span className="text-3xl font-extrabold gradient-text">৳{finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* --- COUPON UI BLOCK --- */}
            <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10 mb-6">
              <div className="flex items-center text-sm font-bold text-gray-300 mb-3">
                <Tag className="w-4 h-4 mr-2 text-brand-400" />
                Have a Promo Code?
              </div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-brand-500/40 focus:outline-none uppercase text-sm transition-all"
                />
                <button 
                  type="submit" 
                  disabled={isApplying || !couponCode}
                  className="bg-white/10 text-gray-200 px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/15 transition-all disabled:opacity-30"
                >
                  {isApplying ? '...' : 'Apply'}
                </button>
              </form>
              
              {couponError && <p className="text-red-400 text-sm mt-2 font-medium animate-fade-in">{couponError}</p>}
              {couponSuccess && <p className="text-green-400 text-sm mt-2 font-medium animate-fade-in">{couponSuccess}</p>}
            </div>

            {/* Checkout Button */}
            <button 
              onClick={checkoutHandler}
              className="w-full btn-gradient text-white py-4 text-lg flex justify-center items-center"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
