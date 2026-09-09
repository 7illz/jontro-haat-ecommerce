import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { StoreContext } from '../context/StoreContextContext';
import { createOrder } from '../api/orderApi';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, user, showToast, clearCart, discount, appliedCoupon } = useContext(StoreContext);

  // If the user isn't logged in, send them to the login page
  useEffect(() => {
    if (!user) {
      navigate('/login');
      if (showToast) showToast('Please log in to checkout');
    }
  }, [user, navigate, showToast]);

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    try {
      // 1. Get the token we saved during login
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, please log in again.');

      // Send only identifiers and quantities; the server loads trusted product data.
      const formattedOrderItems = cartItems.map((item) => ({
        qty: item.qty,
        product: item._id || item.id
      }));

      const orderData = {
        orderItems: formattedOrderItems,
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code || undefined,
      };

      // 3. Send the POST request to the Express backend
      await createOrder(orderData);

      if (showToast) showToast('Order placed successfully! 🎉');
      
      // 4. Empty the cart and redirect to home
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Checkout Error:', error);
      if (showToast) showToast(`Error: ${error.message}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Prevent crashing if the cart is empty or undefined
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="text-brand-400 hover:text-brand-300 transition-colors">
          Go back to shopping
        </button>
      </div>
    );
  }

  // Calculate final totals
  const shippingPrice = 10.00;
  const discountAmount = (cartTotal * (discount || 0)) / 100;
  const subtotalAfterDiscount = cartTotal - discountAmount;
  const taxPrice = Number((0.08 * subtotalAfterDiscount).toFixed(2));
  const finalTotal = subtotalAfterDiscount + shippingPrice + taxPrice;

  return (
    <div className="max-w-7xl mx-auto py-8 animate-fade-in relative">
      
      {/* Payment Processing Overlay Modal */}
      {processingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-strong p-10 rounded-3xl flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl shadow-brand-500/20">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-brand-400/20 blur-xl rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-100 mb-2">Placing Order</h3>
            <p className="text-gray-400 text-center text-sm">The server is verifying prices, coupon eligibility, and stock.</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-100 mb-8">Checkout</h1>
      
      <div className="lg:flex lg:space-x-8">
        {/* Left Side: Forms */}
        <div className="lg:w-2/3 space-y-6">
          
          {/* Shipping Form */}
          <div className="glass-strong p-7 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mr-3">
                <Truck className="text-brand-400 h-5 w-5" />
              </div>
              Shipping Address
            </h2>
            <form id="checkout-form" onSubmit={placeOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Street Address</label>
                <input 
                  required 
                  type="text" 
                  name="address" 
                  value={shippingAddress.address} 
                  onChange={handleChange} 
                  className="input-dark" 
                  placeholder="123 Main St" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">City</label>
                  <input 
                    required 
                    type="text" 
                    name="city" 
                    value={shippingAddress.city} 
                    onChange={handleChange} 
                    className="input-dark" 
                    placeholder="New York" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Postal Code</label>
                  <input 
                    required 
                    type="text" 
                    name="postalCode" 
                    value={shippingAddress.postalCode} 
                    onChange={handleChange} 
                    className="input-dark" 
                    placeholder="10001" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Country</label>
                <input 
                  required 
                  type="text" 
                  name="country" 
                  value={shippingAddress.country} 
                  onChange={handleChange} 
                  className="input-dark" 
                  placeholder="United States" 
                />
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="glass-strong p-7 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-100 mb-6 flex items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mr-3">
                <CreditCard className="text-brand-400 h-5 w-5" />
              </div>
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Cash on Delivery' ? 'glass-strong border-brand-500/30 shadow-lg shadow-brand-500/5' : 'glass hover:bg-white/[0.06]'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Cash on Delivery"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-600 bg-gray-800" 
                />
                <span className="ml-3 font-medium text-gray-200">Cash on Delivery</span>
              </label>
              <label className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'Online Payment' ? 'glass-strong border-brand-500/30 shadow-lg shadow-brand-500/5' : 'glass hover:bg-white/[0.06]'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="Online Payment"
                  checked={paymentMethod === 'Online Payment'}
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-600 bg-gray-800" 
                />
                <span className="ml-3 font-medium text-gray-200">Online Payment (pending confirmation)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3 mt-6 lg:mt-0">
          <div className="glass-strong p-7 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold text-gray-100 mb-6 pb-4 border-b border-white/10">Order Summary</h2>
            
            <div className="space-y-3 mb-6 text-gray-400">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate pr-4 text-gray-400">{item.qty}x {item.name}</span>
                  <span className="font-medium text-gray-200 flex-shrink-0">৳{(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-gray-200">৳{cartTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-medium">
                  <span>Discount ({discount}%)</span>
                  <span>-৳{discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-200">৳{shippingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="text-gray-200">৳{taxPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-6 mt-4 mb-8 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-100">Total</span>
              <span className="text-2xl font-extrabold gradient-text">৳{finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              className="w-full btn-gradient text-white h-14 flex items-center justify-center text-lg"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
