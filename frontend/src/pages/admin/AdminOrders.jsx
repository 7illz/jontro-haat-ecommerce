import { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContextContext';
import { X, Package, Truck, CreditCard, ShoppingCart, Clock } from 'lucide-react';

export default function AdminOrders() {
  const { orders = [], updateOrderStatus } = useContext(StoreContext);

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Calculate Dashboard Metrics
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((acc, order) => acc + (order.totalPrice || 0), 0) || 0;
  const pendingDeliveries = orders?.filter(order => !order.isDelivered).length || 0;

  const handleMarkDelivered = (orderId) => {
    if (window.confirm("Mark this order as delivered?")) {
      if (updateOrderStatus) {
        updateOrderStatus(orderId);
      } else {
        alert("Please add the updateOrderStatus function to your StoreContext!");
      }
    }
  };

  return (
    <div className="relative space-y-6 animate-fade-in relative z-10">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 tracking-tight">
            Manage Orders
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Review and process customer orders.</p>
        </div>
      </div>

      {/* Metric Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-3xl font-black text-gray-100">{totalOrders}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-800 flex items-center justify-between overflow-hidden">
          <div className="min-w-0 w-full">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-2xl sm:text-3xl font-black text-green-400 truncate">৳{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Pending Deliveries</p>
            <p className="text-3xl font-black text-yellow-500">{pendingDeliveries}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-900/80 border-b border-gray-800">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Order ID</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Total</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Paid Status</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Delivery</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orders?.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-800/50 transition-colors group">
                    
                    <td className="px-6 py-4 font-mono text-sm font-bold text-gray-500 group-hover:text-gray-300 transition-colors">
                      ...{order._id.substring(order._id.length - 6)}
                    </td>
                    
                    <td className="px-6 py-4 font-bold text-gray-200">
                      {order.user?.name || 'Guest User'}
                    </td>
                    
                    <td className="px-6 py-4 text-gray-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 font-bold text-green-400">
                      ৳{order.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold tracking-wide">
                          Paid: {new Date(order.paidAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold tracking-wide">
                          Not Paid
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {order.isDelivered ? (
                        <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold tracking-wide">
                          Delivered
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold tracking-wide">
                          Pending
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-blue-400 font-bold mr-4 transition-colors p-2 hover:bg-blue-500/10 rounded-lg inline-flex items-center"
                      >
                        Details
                      </button>
                      {!order.isDelivered && (
                        <button 
                          onClick={() => handleMarkDelivered(order._id)} 
                          className="text-gray-400 hover:text-green-400 font-bold transition-colors p-2 hover:bg-green-500/10 rounded-lg inline-flex items-center"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No orders found. When customers check out, they will appear here!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 flex items-center">
                <Package className="w-6 h-6 mr-3 text-green-500" />
                Order Details
              </h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Top Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Shipping Info
                  </h3>
                  <p className="font-bold text-gray-200">{selectedOrder.user?.name || 'Guest User'}</p>
                  <p className="text-gray-400 mt-2 text-sm">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.shippingAddress?.country}</p>
                </div>

                <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Info
                  </h3>
                  <p className="font-medium text-gray-400 text-sm mb-3">Method: <span className="font-bold text-gray-200">{selectedOrder.paymentMethod}</span></p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400 text-sm font-medium">Status:</span> 
                    {selectedOrder.isPaid ? 
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-bold">Paid on {new Date(selectedOrder.paidAt).toLocaleDateString()}</span> : 
                      <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-bold">Unpaid</span>
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">Delivery:</span> 
                    {selectedOrder.isDelivered ? 
                      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-bold">Delivered on {new Date(selectedOrder.deliveredAt).toLocaleDateString()}</span> : 
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-xs font-bold">Pending</span>
                    }
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-3">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 bg-gray-950 p-4 rounded-xl border border-gray-800">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg bg-gray-900 border border-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-200 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">Qty: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-green-400">৳{(item.price * item.qty).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">৳{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-800 pt-6 flex justify-end">
                <div className="w-full max-w-xs space-y-3">
                  <div className="flex justify-between text-sm text-gray-400 font-medium">
                    <span>Items Total:</span>
                    <span>৳{(selectedOrder.totalPrice - selectedOrder.shippingPrice - selectedOrder.taxPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-medium">
                    <span>Shipping:</span>
                    <span>৳{selectedOrder.shippingPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 font-medium">
                    <span>Tax:</span>
                    <span>৳{selectedOrder.taxPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-2">
                    <span className="font-bold text-gray-200 uppercase tracking-widest text-sm">Grand Total:</span>
                    <span className="text-2xl font-black text-green-400">৳{selectedOrder.totalPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
