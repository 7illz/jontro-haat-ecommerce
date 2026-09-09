import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContextContext';
import { User, Package, Truck, CreditCard, ChevronDown, ChevronUp, CheckCircle, Clock, MapPin } from 'lucide-react';
import { getMyOrders } from '../api/orderApi';

const OrderSkeleton = () => (
  <div className="glass p-5 rounded-2xl animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="h-6 w-48 shimmer rounded-xl" />
      <div className="h-6 w-24 shimmer rounded-xl" />
    </div>
    <div className="h-20 w-full shimmer rounded-xl" />
    <div className="flex justify-between border-t border-white/5 pt-4">
      <div className="h-4 w-32 shimmer rounded-xl" />
      <div className="h-4 w-32 shimmer rounded-xl" />
    </div>
  </div>
);

const OrderCard = ({ order, index, user }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="glass rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all duration-300 fade-in-up border border-white/5 shadow-xl"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Order Header (Always Visible) */}
      <div 
        className="p-6 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-brand-400 font-bold bg-brand-500/10 px-2.5 py-1 rounded-lg">
              #{order._id?.slice(-8) || 'Unknown'}
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            {/* Delivery Badge */}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
              order.isDelivered ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            }`}>
              {order.isDelivered ? <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> : <Clock className="w-3.5 h-3.5 mr-1.5" />}
              {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Pending Delivery'}
            </span>

            {/* Payment Badge */}
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${
              order.isPaid ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              {order.isPaid ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-6 mt-2 sm:mt-0">
          <div className="text-left sm:text-right">
            <p className="text-sm text-gray-500 font-medium mb-0.5">Total Amount</p>
            <p className="text-xl font-bold text-gray-100">৳{order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Order Details */}
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-brand-400" />
                Items Purchased
              </h4>
              <div className="space-y-3">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-900" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-200 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-400">৳{(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Summary */}
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-brand-400" />
                  Shipping Address
                </h4>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-300 space-y-1">
                    <p className="font-medium text-gray-200">{user?.name || 'Customer'}</p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                    <p>{order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-brand-400" />
                  Order Summary
                </h4>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Items:</span>
                    <span className="text-gray-200">৳{(order.totalPrice - order.shippingPrice - order.taxPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping:</span>
                    <span className="text-gray-200">৳{order.shippingPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax:</span>
                    <span className="text-gray-200">৳{order.taxPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-white/10 mt-2">
                    <span className="text-gray-200">Total:</span>
                    <span className="text-brand-400">৳{order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useContext(StoreContext);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]); 
        }
        
        setError(null);
      } catch (err) {
        console.error("Profile Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, navigate]);

  if (loading) return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
      <div className="h-10 w-64 shimmer rounded-xl mb-10" />
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => <OrderSkeleton key={i} />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 animate-fade-in">
      
      {/* Show Error if backend fails */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl mb-8 flex items-center justify-between shadow-xl">
          <div>
            <h3 className="font-bold text-lg">Error loading orders</h3>
            <p className="mt-1 opacity-90">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl font-bold transition-colors">Retry</button>
        </div>
      )}

      {/* Profile Header */}
      <div className="glass p-8 rounded-3xl mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 border border-brand-500/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] z-10 border-4 border-gray-950 shrink-0">
          <User className="w-10 h-10 text-white" />
        </div>
        <div className="text-center md:text-left z-10 pt-2">
          <h1 className="text-3xl font-black text-white tracking-tight">{user?.name || 'My Account'}</h1>
          <p className="text-gray-400 font-medium mt-1">{user?.email}</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 uppercase tracking-widest">
            {user?.role === 'owner' ? 'Administrator' : 'Customer Account'}
          </div>
        </div>
      </div>
      
      {/* Order List */}
      <div>
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-6 flex items-center gap-3">
          <Package className="w-7 h-7 text-brand-400" />
          Order History
        </h2>
        
        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="glass p-12 rounded-3xl text-center border border-white/5 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">No orders placed yet.</h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto">When you purchase items from our store, you will be able to track their delivery status and details here.</p>
            <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, index) => (
              <OrderCard key={order._id} order={order} index={index} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
