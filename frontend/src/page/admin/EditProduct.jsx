import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/admin/EditProduct.css'; // Import the external CSS file

const EditProduct = () => {
  const { backendUrl, adminIsLoggedin, getAdminAuthState } = useContext(AppContext);
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Check admin authentication before fetching product details
  useEffect(() => {
    const checkAdminAuth = async () => {
      await getAdminAuthState();
      if (!adminIsLoggedin) {
        navigate('/admin'); // Redirect if admin is not logged in
      }
    };
    checkAdminAuth();
  }, [adminIsLoggedin, getAdminAuthState, navigate]);

  useEffect(() => {
    if (!adminIsLoggedin) return; // Prevent fetching if not authenticated

    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/product/products/${productId}`);
        if (response.data.success) {
          setProduct(response.data.product);
        } else {
          toast.error('Failed to load product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        toast.error('Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, backendUrl, adminIsLoggedin]);

  const handleFileChange = (e) => {
    if (e.target.files.length > 3) {
      setError('You can upload only 3 images');
    } else {
      setImages(e.target.files);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminIsLoggedin) {
      toast.error('Unauthorized! Please log in as an admin.');
      return navigate('/admin'); // Redirect if admin is not logged in
    }

    if (!product.name || !product.description || !product.price || !product.category || !product.stock) {
      setError('All fields are required');
      return;
    }

    if (images.length > 3) {
      setError('Please upload a maximum of 3 images');
      return;
    }

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    formData.append('stock', product.stock);

    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      const response = await axios.put(
        `${backendUrl}/product/update-product/${productId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (response.data.success) {
        toast.success('Product updated successfully');
        navigate('/dashboard');
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error occurred while updating product');
    }
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="edit-product-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={handleBack} className="back-btn">←</button>
      </div>
      <h3 className="edit-product-title">Edit Product</h3>
      {loading ? (
        <p className="loading-text">Loading product details...</p>
      ) : (
        <form className="edit-product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              className="form-textarea"
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              value={product.stock}
              onChange={(e) => setProduct({ ...product, stock: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Product Images (Max 3)</label>
            <input type="file" multiple onChange={handleFileChange} className="form-file" />
            {error && <p className="error-text">{error}</p>}
          </div>
          <div className="form-group">
            <button type="submit" className="submit-btn">Update Product</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
