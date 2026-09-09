import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Live Chat', path: '/admin/chat', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-gray-950 font-sans text-gray-100 overflow-hidden selection:bg-green-500/30">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col relative z-20">
        <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tight flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                  isActive 
                    ? 'text-green-400 bg-green-500/10 border border-green-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer of Sidebar */}
        <div className="p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <Link to="/" className="flex items-center text-sm text-gray-500 hover:text-green-400 transition-colors font-medium group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Abstract background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}
