import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// 1. Added LogOut and Menu/X to your lucide-react imports
import { ShoppingCart, Search, User, Package, MapPin, LogOut, Menu, X } from 'lucide-react';
import { StoreContext } from '../context/StoreContextContext';

export default function Navbar() {
  // 2. Pulled in logout from Context
  const { cartCount, user, searchQuery, setSearchQuery, logout } = useContext(StoreContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // 3. Created the logout handler
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center cursor-pointer group" onClick={closeMobileMenu}>
              <div className="relative">
                <Package className="h-8 w-8 text-brand-400 group-hover:text-brand-300 transition-colors duration-300" />
                <div className="absolute inset-0 bg-brand-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="ml-2 text-xl font-bold tracking-tight gradient-text">NexusStore</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:bg-white/8 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/40 sm:text-sm transition-all duration-300"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-5">
              
              <Link to="/contact" className="flex items-center space-x-1.5 text-gray-400 hover:text-brand-400 transition-colors duration-300 cursor-pointer" title="Find Our Store">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Store</span>
              </Link>

              {/* Conditional routing for User/Login/Logout */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-1.5 text-gray-400 hover:text-brand-400 transition-colors duration-300 cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-brand-300" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  
                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center space-x-1.5 text-gray-500 hover:text-red-400 transition-colors duration-300 cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-brand-400 transition-colors duration-300 cursor-pointer">
                  Log In
                </Link>
              )}
              
              {user?.role === 'owner' && (
                <Link to="/admin" className="text-sm font-semibold text-brand-300 bg-brand-600/20 border border-brand-500/30 px-3.5 py-1.5 rounded-full hover:bg-brand-600/30 transition-all duration-300">
                  Admin
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-400 hover:text-brand-400 transition-colors duration-300 group">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold leading-none text-white bg-gradient-to-r from-brand-600 to-accent-500 rounded-full shadow-lg shadow-brand-500/30">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-3">
              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="p-2 text-gray-400 hover:text-brand-400 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Cart (Mobile) */}
              <Link to="/cart" className="relative text-gray-400 hover:text-brand-400 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold leading-none text-white bg-gradient-to-r from-brand-600 to-accent-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-brand-400 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (expandable) */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 sm:text-sm transition-all"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={closeMobileMenu}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
          
          {/* Slide-in Drawer */}
          <div 
            className="absolute right-0 top-0 h-full w-72 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl animate-slide-in-right p-6 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-brand-400 transition-all">
                <Package className="h-5 w-5" />
                <span className="font-medium">Home</span>
              </Link>
              
              <Link to="/contact" onClick={closeMobileMenu} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-brand-400 transition-all">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">Store Location</span>
              </Link>

              {user ? (
                <>
                  <Link to="/profile" onClick={closeMobileMenu} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-brand-400 transition-all">
                    <User className="h-5 w-5" />
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  
                  {user?.role === 'owner' && (
                    <Link to="/admin" onClick={closeMobileMenu} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-brand-300 hover:bg-brand-600/10 transition-all">
                      <Package className="h-5 w-5" />
                      <span className="font-medium">Admin Panel</span>
                    </Link>
                  )}

                  <div className="pt-2 mt-2 border-t border-white/10">
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-brand-400 transition-all">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Log In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
