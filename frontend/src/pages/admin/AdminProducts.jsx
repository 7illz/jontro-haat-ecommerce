import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContextContext';
import { Plus, Edit2, Trash2, Box, AlertCircle, Search } from 'lucide-react';

export default function AdminProducts() {
  const { products, addProduct, deleteProduct, updateProduct } = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialProductState = {
    name: '', 
    brand: '', 
    category: '', 
    price: '', 
    countInStock: '', 
    description: '', 
    image: '', 
    imageFile: null 
  };
  
  const [newProduct, setNewProduct] = useState(initialProductState);
  const [searchQuery, setSearchQuery] = useState('');

  const safeProducts = Array.isArray(products) ? products : [];
  
  const filteredProducts = safeProducts.filter(product => {
    const query = searchQuery.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.brand && product.brand.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });

  const totalProducts = safeProducts.length;
  const totalInventoryValue = safeProducts.reduce((acc, item) => acc + ((item?.price || 0) * (item?.countInStock || 0)), 0);
  const lowStockItems = safeProducts.filter(item => item.countInStock < 5).length;

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      countInStock: product.countInStock,
      description: product.description,
      image: product.image,
      imageFile: null
    });
    setEditingId(product._id); 
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload;

    if (newProduct.imageFile) {
      payload = new FormData();
      payload.append('name', newProduct.name);
      payload.append('brand', newProduct.brand);
      payload.append('category', newProduct.category);
      payload.append('price', Number(newProduct.price));
      payload.append('countInStock', Number(newProduct.countInStock));
      payload.append('description', newProduct.description);
      payload.append('imageFile', newProduct.imageFile); 
    } else {
      payload = {
        name: newProduct.name,
        brand: newProduct.brand,
        category: newProduct.category,
        price: Number(newProduct.price),
        countInStock: Number(newProduct.countInStock),
        description: newProduct.description,
        image: newProduct.image 
      };
    }

    let success;
    if (editingId) {
      success = await updateProduct(editingId, payload);
    } else {
      success = await addProduct(payload);
    }

    if (success) {
      setNewProduct(initialProductState); 
      setEditingId(null); 
      setIsModalOpen(false);
    } else {
      alert(`Failed to ${editingId ? 'update' : 'create'} product. Check backend terminal for errors.`);
    }
  };

  const handleFileChange = (e) => {
    setNewProduct({ ...newProduct, imageFile: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleCloseModal = () => {
    setNewProduct(initialProductState);
    setEditingId(null);
    setIsModalOpen(false);
  }

  return (
    <div className="relative space-y-6 animate-fade-in relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 tracking-tight">
            Manage Products
          </h1>
          <p className="text-gray-400 mt-1 font-medium">Add, edit, or remove inventory.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder-gray-500"
            />
          </div>
          <button 
            onClick={() => {
              setNewProduct(initialProductState);
              setEditingId(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-green-500 text-black px-5 py-2.5 rounded-xl hover:bg-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all font-bold tracking-wide w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Products</p>
            <p className="text-3xl font-black text-gray-100">{totalProducts}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Box className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between overflow-hidden">
          <div className="min-w-0 w-full">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Value</p>
            <p className="text-2xl sm:text-3xl font-black text-green-400 truncate">৳{totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Low Stock Alerts</p>
            <p className="text-3xl font-black text-yellow-500">{lowStockItems}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-900/80 border-b border-gray-800">
              <tr>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Category / Brand</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Price</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs">Stock Status</th>
                <th className="px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/product/${product._id}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 flex-shrink-0 overflow-hidden">
                          <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <span className="font-bold text-gray-200 group-hover:text-green-400 transition-colors">{product.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block text-sm font-bold text-gray-300">{product.category}</span>
                      <span className="block text-xs font-medium text-gray-500">{product.brand}</span>
                    </td>
                    <td className="px-6 py-4 text-green-400 font-bold">৳{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">
                      {product.countInStock > 0 ? (
                        <span className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold tracking-wide">
                          In Stock ({product.countInStock})
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold tracking-wide">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEditClick(product)} className="text-gray-400 hover:text-blue-400 transition-colors p-2 hover:bg-blue-500/10 rounded-lg inline-flex items-center">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg inline-flex items-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No products found. Start adding inventory!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                  <input type="text" name="name" required value={newProduct.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                </div>

                <div className="p-5 bg-gray-950/50 border border-gray-800 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Image (Choose one)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">Upload File</label>
                      <input 
                        type="file" 
                        name="imageFile" 
                        accept="image/*"
                        onChange={handleFileChange} 
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 hover:file:text-white transition-colors cursor-pointer" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">OR Image URL</label>
                      <input 
                        type="text" 
                        name="image" 
                        placeholder="https://..."
                        value={newProduct.image} 
                        onChange={handleInputChange} 
                        disabled={!!newProduct.imageFile}
                        required={!newProduct.imageFile && !editingId} 
                        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Brand</label>
                    <input type="text" name="brand" required value={newProduct.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <input type="text" name="category" required value={newProduct.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (৳)</label>
                    <input type="number" name="price" step="0.01" min="0" required value={newProduct.price} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Count In Stock</label>
                    <input type="number" name="countInStock" min="0" required value={newProduct.countInStock} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea name="description" rows="3" required value={newProduct.description} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all resize-none"></textarea>
                </div>

                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-800">
                  <button type="button" onClick={handleCloseModal} className="px-6 py-3 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-xl font-bold transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-3 bg-green-500 text-black rounded-xl hover:bg-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] font-bold tracking-wide transition-all">
                    {editingId ? "Update Product" : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
