import { Outlet, Link, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard KPI', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
        <div className="p-6 text-2xl font-bold border-b border-gray-800 tracking-wide">
          Admin Panel
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navLinks.map((link) => {
            // Check if the current URL matches the link path exactly
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-800">
          <Link to="/" className="flex items-center text-sm text-gray-400 hover:text-white transition">
            <span className="mr-2">&larr;</span> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      
    </div>
  );
}
