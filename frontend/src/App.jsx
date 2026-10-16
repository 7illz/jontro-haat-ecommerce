import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { StoreContext } from './context/StoreContextContext';
import Navbar from './components/Navbar';

import AdminRoute from './components/AdminRoute';
import Chatbot from './components/Chatbot'; // Import the Chatbot component

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DashboardHome = lazy(() => import('./pages/admin/DashboardHome'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));

const RouteFallback = () => <div className="min-h-[40vh] grid place-items-center text-gray-400">Loading…</div>;

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
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </Router>
    </StoreProvider>
  );
}
