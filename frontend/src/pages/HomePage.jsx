import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Filter, ArrowDownUp } from 'lucide-react';
import { StoreContext } from '../context/StoreContextContext';
import { listProducts } from '../api/productApi';

// Shimmer Loading Skeleton for Product Cards
const ProductSkeleton = () => (
  <div className="glass rounded-2xl overflow-hidden">
    <div className="h-64 shimmer" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 shimmer rounded-full" />
      <div className="h-5 w-3/4 shimmer rounded-full" />
      <div className="h-3 w-24 shimmer rounded-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-16 shimmer rounded-full" />
        <div className="h-10 w-10 shimmer rounded-full" />
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const { searchQuery, addToCart } = useContext(StoreContext);
  
  // Local state for our filters and products
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, image: '/images/hero_slide_1.png', label: 'Pro Gaming Gear', desc: 'Up to 40% Off' },
    { id: 2, image: '/images/hero_slide_2.png', label: 'Premium Watches', desc: 'New Arrivals' },
    { id: 3, image: '/images/hero_slide_3.png', label: 'Sleek Laptops', desc: 'Starting at ৳124,990' }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Fetch products whenever search, category, or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await listProducts({ keyword: searchQuery, category: selectedCategory, sort: sortOrder });
        
        // Update our state with data from the new controller
        setProducts(data.products || []);
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    // Use a small timeout (debounce) so we don't spam the backend while the user is typing
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategory, sortOrder]);

  return (
    <div>
      {/* Hero Section with Animated Gradient Mesh */}
      <div className="relative rounded-2xl overflow-hidden mb-12 shadow-2xl shadow-brand-900/20">
        <div className="gradient-mesh relative px-8 py-16 sm:px-16 sm:py-24 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Floating particle decorations */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-brand-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
          
          <div className="relative z-10 lg:w-1/2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse" />
              New Arrivals Available
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4">
              <span className="gradient-text">Next-Gen Tech</span>
              <br />
              <span className="text-white">& Gear</span>
            </h1>
            <p className="max-w-xl text-lg text-gray-400 mb-8">
              Upgrade your lifestyle with our premium selection of electronics, wearables, and accessories. Fast shipping guaranteed.
            </p>
            <Link to="/" className="btn-gradient px-8 py-3.5 text-white inline-flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4" />
              Shop Now
            </Link>
          </div>

          {/* Right Slider */}
          <div className="relative z-10 lg:w-1/2 w-full max-w-lg">
            <div className="relative w-full aspect-video sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <img src={slide.image} alt={slide.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/40 to-transparent flex flex-col justify-end p-6 sm:p-8">
                    <h3 className="text-2xl font-bold text-white mb-1">{slide.label}</h3>
                    <p className="text-brand-400 font-medium">{slide.desc}</p>
                  </div>
                </div>
              ))}
              
              {/* Slider Dots */}
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
                {slides.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-brand-400' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 glass p-4 rounded-2xl">
        <h2 className="text-xl font-bold tracking-tight text-gray-100">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
        </h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          
          {/* Category Filter */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-4 h-4 text-gray-500" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-9 pr-8 py-2.5 w-full sm:w-48 bg-white/5 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 appearance-none cursor-pointer transition-all"
            >
              <option value="" className="bg-gray-900">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat} className="bg-gray-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative flex items-center">
            <ArrowDownUp className="absolute left-3 w-4 h-4 text-gray-500" />
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="pl-9 pr-8 py-2.5 w-full sm:w-48 bg-white/5 border border-white/10 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/40 appearance-none cursor-pointer transition-all"
            >
              <option value="newest" className="bg-gray-900">Newest Arrivals</option>
              <option value="lowest" className="bg-gray-900">Price: Low to High</option>
              <option value="highest" className="bg-gray-900">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <h3 className="text-xl font-bold text-gray-200 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSelectedCategory(''); setSortOrder('newest'); }}
            className="mt-4 text-brand-400 font-medium hover:text-brand-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div 
              key={product._id} 
              className="glass rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-brand-900/10 hover:-translate-y-1 transition-all duration-300 group fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <Link to={`/product/${product._id}`}>
                <div className="relative h-64 bg-white/5 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.countInStock === 0 && (
                    <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-5">
                <div className="text-xs text-brand-400 font-semibold mb-1 uppercase tracking-wider">{product.category}</div>
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-base font-semibold text-gray-100 hover:text-brand-400 line-clamp-1 transition-colors duration-200">{product.name}</h3>
                </Link>
                <div className="flex items-center mt-1.5 mb-3 text-sm text-gray-500">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {product.rating} ({product.numReviews})
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-100">৳{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.countInStock === 0}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${product.countInStock === 0 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-brand-600/20 text-brand-400 hover:bg-gradient-to-r hover:from-brand-600 hover:to-accent-500 hover:text-white hover:shadow-lg hover:shadow-brand-500/20'}`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
