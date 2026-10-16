import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../context/StoreContextContext';
import { useGoogleLogin } from '@react-oauth/google';
import { login, register, googleLogin } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, showToast } = useContext(StoreContext);
  const googleLoginEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const redirect = location.search ? location.search.split('=')[1] : '/';

  React.useEffect(() => {
    if (user) {
      navigate(redirect === '/' ? '/' : `/${redirect}`);
    }
  }, [navigate, redirect, user]);

  // Local state for the form
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STANDARD EMAIL/PASSWORD LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await (isLogin ? login(formData) : register(formData));

      localStorage.setItem('token', data.token);
      setUser({
        id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || (data.isAdmin ? 'owner' : 'user') 
      });

      showToast(`Successfully ${isLogin ? 'logged in' : 'registered'}!`);
      navigate(redirect === '/' ? '/' : `/${redirect}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the Google access token to your backend to verify and create a JWT
        const data = await googleLogin(tokenResponse.access_token);

        // Store standard JWT from YOUR backend (not Google's)
        localStorage.setItem('token', data.token);
        setUser({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role || (data.isAdmin ? 'owner' : 'user') 
        });

        showToast('Successfully logged in with Google!');
        navigate(redirect === '/' ? '/' : `/${redirect}`);
      } catch (err) {
        setError(err.message);
      }
    },
    onError: () => setError('Google authentication failed.'),
  });

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Gradient accent top line */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-accent-500 to-brand-600 rounded-t-2xl" />
        
        <div className="glass-strong rounded-b-2xl rounded-t-none overflow-hidden">
          <div className="p-8">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-100">
                {isLogin ? 'Welcome Back' : 'Create an Account'}
              </h2>
              <p className="text-gray-500 mt-2">Secure access to your JontroHaat account</p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4 animate-fade-in">
                {error}
              </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name (Only for Registration) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                  <input 
                    name="name"
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={handleChange}
                    className="input-dark" 
                  />
                </div>
              )}
              
              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                <input 
                  name="email"
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className="input-dark" 
                />
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <input 
                  name="password"
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  className="input-dark" 
                />
              </div>
              
              {/* Submit Button */}
              <button type="submit" className="w-full btn-gradient text-white py-3.5 mt-4">
                {isLogin ? 'Sign In' : 'Register'}
              </button>
            </form>

            {/* Toggle Login/Register Mode */}
            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
              >
                {isLogin ? 'Need an account? Register here' : 'Already have an account? Sign in'}
              </button>
            </div>

            {/* --- GOOGLE LOGIN DIVIDER --- */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-transparent text-gray-500 backdrop-blur-sm">Or continue with</span>
              </div>
            </div>

            {/* --- GOOGLE LOGIN BUTTON --- */}
            <div className="mt-6">
              <button 
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={!googleLoginEnabled}
                title={googleLoginEnabled ? 'Sign in with Google' : 'Set VITE_GOOGLE_CLIENT_ID to enable Google login'}
                className="relative z-10 w-full flex items-center justify-center space-x-2 glass hover:bg-white/8 text-gray-300 font-medium py-3 rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {/* Google "G" Logo SVG */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
