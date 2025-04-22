import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/admin/AddProduct.css'; // Import external CSS file

const AddProduct = () => {
  const { backendUrl, adminIsLoggedin, getAdminAuthState } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  // ✅ Check if admin is logged in
  useEffect(() => {
    const checkAdminAuth = async () => {
      await getAdminAuthState();
      if (!adminIsLoggedin) {
        navigate('/admin'); // Redirect if admin is not logged in
      }
    };
    checkAdminAuth();
  }, [adminIsLoggedin, getAdminAuthState, navigate]);

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

    if (!name || !description || !price || !category || !stock) {
      setError('All fields are required');
      return;
    }

    if (images.length !== 3) {
      setError('Please upload exactly 3 images');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('stock', stock);

    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    try {
      const response = await axios.post(`${backendUrl}/product/add-product`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Product added successfully!');
        resetForm();
      } else {
        toast.error('Failed to add product: ' + response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding product. Please try again.');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImages([]);
    setError('');
  };

 const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="add-product-container">
       <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={handleBack} className="back-btn">←</button>
      </div>
      <h3 className="add-product-title">Add New Product</h3>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            placeholder="Enter product name"
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-textarea"
            placeholder="Enter product description"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="form-input"
            placeholder="Enter product price"
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            placeholder="Enter product category"
          />
        </div>
        <div className="form-group">
          <label>Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="form-input"
            placeholder="Enter stock quantity"
          />
        </div>
        <div className="form-group">
          <label>Product Images (3 required)</label>
          <input type="file" multiple onChange={handleFileChange} className="form-file" />
          {error && <p className="error-text">{error}</p>}
        </div>
        <div className="form-group">
          <button type="submit" className="submit-btn">Add Product</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
