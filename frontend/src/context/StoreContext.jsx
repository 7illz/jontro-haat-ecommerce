import { useState, useEffect } from 'react';
import { StoreContext } from './StoreContextContext';
import { listProducts, createProduct as createProductRequest, deleteProduct as deleteProductRequest, updateProduct as updateProductRequest } from '../api/productApi';
import { getAllOrders, markOrderDelivered } from '../api/orderApi';
import { getPricingConfig } from '../api/pricingApi';

const readStoredJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
};

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return readStoredJson('user', null);
  });

  const [cartItems, setCartItems] = useState(() => readStoredJson('cartItems', []));
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const storedCart = readStoredJson('cartItems', []);
    return storedCart.length ? readStoredJson('appliedCoupon', null) : null;
  });
  const discount = Number(appliedCoupon?.discountPercentage || 0);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [pricingError, setPricingError] = useState('');

  useEffect(() => {
    getPricingConfig()
      .then(setPricing)
      .catch(() => setPricingError('Checkout pricing is temporarily unavailable.'));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    else localStorage.removeItem('appliedCoupon');
    localStorage.removeItem('cartDiscount');
  }, [appliedCoupon]);

  useEffect(() => {
    listProducts()
      .then((data) => {
        const safeProducts = Array.isArray(data) ? data : (data?.products || []);
        setProducts(safeProducts);
      })
      .catch((err) => {
        console.error("Database connection error (Products):", err);
        setProducts([]); 
      });
  }, []);

  useEffect(() => {
    // Only fetch ALL orders if the user is logged in as an owner (admin)
    if (user && user.role === 'owner') {
      getAllOrders()
        .then((data) => {
          const safeOrders = Array.isArray(data) ? data : (data?.orders || []);
          setOrders(safeOrders);
        })
        .catch((err) => {
          console.error("Database connection error (Orders):", err);
          setOrders([]); 
        });
    }
  }, [user]);

  // Function for Admin Dashboard to mark orders as delivered
  const updateOrderStatus = async (orderId) => {
    try {
      const updatedOrder = await markOrderDelivered(orderId);
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      showToast("Order marked as delivered!");
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Error updating order status.");
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOrders([]);
    showToast("Logged out successfully");
  };
  const addToCart = (newProduct) => {
    setCartItems((prevCartItems) => {
      const itemExists = prevCartItems.find((item) => item._id === newProduct._id);
      if (itemExists) {
        return prevCartItems.map((item) =>
          item._id === itemExists._id 
            ? { ...newProduct, qty: newProduct.qty || item.qty } 
            : item
        );
      } else {
        return [...prevCartItems, { ...newProduct, qty: newProduct.qty || 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    const nextItems = cartItems.filter((item) => item._id !== id);
    setCartItems(nextItems);
    if (nextItems.length === 0) setAppliedCoupon(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const cartTotal = safeCartItems.reduce((acc, item) => acc + ((item?.price || 0) * (item?.qty || 0)), 0);
  const cartCount = safeCartItems.reduce((acc, item) => acc + (item?.qty || 0), 0);

  const addProduct = async (productData) => {
      try {
        const createdProduct = await createProductRequest(productData);
        setProducts(prev => [...prev, createdProduct]);
        return true;
      } catch (error) {
        console.error("API Error - Creating product:", error);
        return false;
      }
    };

  const deleteProduct = async (id) => {
    try {
      await deleteProductRequest(id);
      setProducts(prev => prev.filter((product) => product._id !== id));
    } catch (error) {
      console.error("API Error - Deleting product:", error);
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const updatedItem = await updateProductRequest(id, productData);
      setProducts(prev => prev.map(p => p._id === id ? updatedItem : p));
      return true;
    } catch (error) {
      console.error("API Error - Updating product:", error);
      return false;
    }
  };



  return (
    <StoreContext.Provider value={{ 
      user, setUser, logout, // 👇 ADDED logout HERE
      searchQuery, setSearchQuery, 
      toast, showToast,
      discount, appliedCoupon, setAppliedCoupon,
      cartItems, setCartItems, addToCart, removeFromCart, clearCart, cartTotal, cartCount,
      products, addProduct, deleteProduct, updateProduct,
      orders, updateOrderStatus,
      pricing, pricingError
    }}>
      {children}
    </StoreContext.Provider>
  );
};
