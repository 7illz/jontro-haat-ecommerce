import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StoreContext } from '../context/StoreContextContext';
import { Star, ShoppingCart, User, AlertCircle } from 'lucide-react';
import { createReview, getProduct } from '../api/productApi';

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart, user } = useContext(StoreContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Fetch the product from the backend
  const fetchProduct = useCallback(async () => {
    try {
      setProduct(await getProduct(id));
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchProduct(), 0);
    return () => clearTimeout(timer);
  }, [fetchProduct]);

  // Handle the Review Form Submission
  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      await createReview(id, { rating, comment });
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      await fetchProduct();
    } catch (error) {
      setReviewError(error.message || 'Server error. Please try again later.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-200">Product not found</h2>
      <Link to="/" className="text-brand-400 hover:text-brand-300 mt-4 inline-block transition-colors">Back to shop</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Product Details Section */}
      <div className="flex flex-col md:flex-row gap-10 mb-16 animate-fade-in">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="relative rounded-2xl overflow-hidden glass group">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="text-sm text-brand-400 font-bold tracking-wider uppercase mb-2">{product.category}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mb-4">{product.name}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center mr-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-700'}`} />
              ))}
            </div>
            <span className="text-gray-500 font-medium">({product.numReviews || 0} reviews)</span>
          </div>
          
          <p className="text-3xl font-bold text-gray-100 mb-6">৳{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-gray-400 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-8">
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold ${product.countInStock > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${product.countInStock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
              {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            disabled={product.countInStock === 0}
            className={`w-full flex justify-center items-center py-4 px-8 rounded-xl text-lg font-bold transition-all duration-300 ${product.countInStock === 0 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'btn-gradient text-white'}`}
          >
            <ShoppingCart className="mr-2 h-6 w-6" />
            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      <hr className="border-white/5 mb-12" />

      {/* Reviews Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Side: Existing Reviews List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Customer Reviews</h2>
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="glass p-5 rounded-xl hover:bg-white/[0.06] transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-400" />
                      </div>
                      <span className="font-bold text-gray-200">{review.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{review.createdAt?.substring(0, 10)}</span>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-700'}`} />
                    ))}
                  </div>
                  <p className="text-gray-400">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Write a Review Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Write a Review</h2>
          {user ? (
            <form onSubmit={submitReview} className="glass p-6 rounded-xl">
              {reviewError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center text-red-400 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-green-400 text-sm font-medium animate-fade-in">
                  Review submitted successfully!
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 focus:ring-2 focus:ring-brand-500/40 focus:outline-none transition-all"
                >
                  <option value="5" className="bg-gray-900">5 - Excellent</option>
                  <option value="4" className="bg-gray-900">4 - Very Good</option>
                  <option value="3" className="bg-gray-900">3 - Good</option>
                  <option value="2" className="bg-gray-900">2 - Fair</option>
                  <option value="1" className="bg-gray-900">1 - Poor</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Comment</label>
                <textarea 
                  rows="4" 
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike about this product?"
                  className="input-dark resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={reviewLoading}
                className="w-full btn-gradient text-white py-3 disabled:opacity-50"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="glass p-8 rounded-xl text-center">
              <p className="text-gray-500 mb-4">You must be logged in to post a review.</p>
              <Link to="/login" className="btn-gradient text-white px-6 py-2.5 inline-block">
                Log In Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
