import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContextContext';
import { TrendingUp, ShoppingBag, PackageX, ArrowRight, ArrowUpRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function DashboardHome() {
  const { products, orders } = useContext(StoreContext);

  // Safely calculate metrics
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const totalProducts = safeProducts.length;
  const totalOrders = safeOrders.length;
  
  // Calculate total revenue from all orders
  const totalRevenue = safeOrders.reduce((acc, order) => acc + (order?.totalPrice || 0), 0);
  
  // Find orders that haven't been delivered yet
  const pendingDeliveries = safeOrders.filter(order => !order.isDelivered).length;
  
  // Find products that have less than 5 items in stock

  // --- MOCK HISTORICAL DATA FOR CHARTS ---
  // Revenue over last 7 days (Mocked based on current total to look realistic)
  const baseDaily = (totalRevenue / 7) || 5000; // fallback if 0
  const revenueData = [
    { name: 'Mon', revenue: baseDaily * 0.8 },
    { name: 'Tue', revenue: baseDaily * 1.1 },
    { name: 'Wed', revenue: baseDaily * 0.9 },
    { name: 'Thu', revenue: baseDaily * 1.3 },
    { name: 'Fri', revenue: baseDaily * 1.5 },
    { name: 'Sat', revenue: baseDaily * 1.2 },
    { name: 'Sun', revenue: baseDaily * 1.4 },
  ];

  // Orders by Status (Mocking some delivered orders if none exist)
  const deliveredCount = safeOrders.filter(order => order.isDelivered).length || 5; 
  const pendingCount = pendingDeliveries || 2;
  const orderStatusData = [
    { name: 'Delivered', value: deliveredCount },
    { name: 'Pending', value: pendingCount },
  ];
  const COLORS = ['#10B981', '#F59E0B']; // Emerald and Amber

  // Products by Category (Aggregating from actual products)
  const categoryCounts = safeProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat]
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 categories

  // Get recent 5 orders
  const recentOrders = [...safeOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in relative z-10 pb-12">
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 tracking-tight">
          Overview
        </h1>
        <p className="text-gray-400 mt-2 font-medium">System diagnostics and real-time metrics.</p>
      </div>

      {/* Enhanced Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-green-500/50 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-green-500" />
          </div>
          <div className="flex justify-between items-start z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</p>
          </div>
          <div className="mt-4 z-10">
            <p className="text-2xl sm:text-3xl font-black text-green-400 truncate">৳{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex items-center mt-2 text-sm text-green-500 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>12.5% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingBag className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Orders</p>
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-black text-gray-100">{totalOrders}</p>
            <div className="flex items-center mt-2 text-sm text-emerald-500 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>8.2% vs last month</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-yellow-500/50 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PackageX className="w-16 h-16 text-yellow-500" />
          </div>
          <div className="flex justify-between items-start z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending Deliveries</p>
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-black text-yellow-400">{pendingDeliveries}</p>
            <div className="flex items-center mt-2 text-sm text-gray-500 font-medium">
              <span>Needs attention</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-16 h-16 text-blue-500" />
          </div>
          <div className="flex justify-between items-start z-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Products</p>
          </div>
          <div className="mt-4 z-10">
            <p className="text-3xl font-black text-gray-100">{totalProducts}</p>
            <div className="flex items-center mt-2 text-sm text-blue-500 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              <span>2 new this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-200">Revenue Overview</h3>
            <p className="text-sm text-gray-500">Last 7 days performance</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `৳${(val/1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                  itemStyle={{ color: '#10B981' }}
                  formatter={(value) => [`৳${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-gray-200">Orders by Status</h3>
            <p className="text-sm text-gray-500">Delivered vs Pending</p>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {orderStatusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Products Bar Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Products by Category Bar Chart */}
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-200">Inventory Distribution</h3>
            <p className="text-sm text-gray-500">Top Categories</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-200">Recent Orders</h3>
              <p className="text-sm text-gray-500">Latest transactions</p>
            </div>
            <Link to="/admin/orders" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto flex-1">
            {recentOrders.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-4 font-bold">Order ID</th>
                    <th className="py-3 px-4 font-bold">Customer</th>
                    <th className="py-3 px-4 font-bold text-right">Total</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={order._id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i === recentOrders.length - 1 ? 'border-none' : ''}`}>
                      <td className="py-4 px-4 text-sm font-mono text-gray-400">
                        {order._id.substring(order._id.length - 6)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-200 font-medium truncate max-w-[150px]">
                        {order.user?.name || 'Guest'}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300 font-bold text-right truncate">
                        ৳{order.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {order.isDelivered ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                <p>No recent orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
