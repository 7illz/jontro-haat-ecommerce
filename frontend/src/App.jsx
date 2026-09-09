import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { StoreContext } from './context/StoreContextContext';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';

import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard'; // This acts as your Admin Layout/Sidebar
import DashboardHome from './pages/admin/DashboardHome';   // This is your KPI dashboard

import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminChat from './pages/admin/AdminChat';
import Chatbot from './components/Chatbot'; // Import the Chatbot component

// Toast notification component
const ToastNotification = () => {
  const { toast } = useContext(StoreContext);
  if (!toast) return null;
  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-up">
      <div className="glass-strong px-6 py-3 rounded-xl shadow-2xl text-sm font-medium text-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        {toast}
      </div>
    </div>
  );
};

// 1. Create a layout shell for the customer-facing pages
const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 font-sans text-gray-100 relative">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      {/* 👇 We place the Chatbot here so it ONLY shows up for customers, not in the Admin panel! */}
      <Chatbot />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          
          {/* 🛒 STOREFRONT ROUTES (Includes Navbar, max-width container, AND Chatbot) */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* 🔒 PROTECTED ADMIN SECTION (Full width, independent layout, NO Chatbot) */}
          <Route element={<AdminRoute />}>
            {/* The AdminDashboard component here holds your Sidebar and <Outlet /> */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="chat" element={<AdminChat />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </StoreProvider>
  );
}
