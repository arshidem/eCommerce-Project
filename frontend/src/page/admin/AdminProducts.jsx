import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Trash2, Menu } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import "../../css/admin/AdminProducts.css";
import { SyncLoader } from "react-spinners";
import SearchBox from "../user/navbar/SearchBox";

const AdminProducts = () => {
  const { backendUrl, token, adminIsLoggedin, getAdminAuthState } = useContext(AppContext);
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      await getAdminAuthState();
      if (!adminIsLoggedin) {
        navigate("/admin");
      }
    };
    checkAdminAuth();
  }, [adminIsLoggedin, getAdminAuthState, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!adminIsLoggedin) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `${backendUrl}/product/products?category=${selectedCategory}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(response.data || []);
        setFilteredProducts(response.data || []);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, backendUrl, token, adminIsLoggedin]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowSidebar(false);
  };

  const handleDeleteProduct = (productId) => {
    toast(({ closeToast }) => (
      <div>
        <p>Are you sure you want to delete this product?</p>
        <div className="toast-buttons">
          <button className="confirm-btn" onClick={() => confirmDelete(productId, closeToast)}>✔ Yes</button>
          <button className="cancel-btn" onClick={closeToast}>❌ No</button>
        </div>
      </div>
    ), {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      hideProgressBar: true,
      className: "custom-toast",
    });
  };

  const confirmDelete = async (productId, closeToast) => {
    closeToast();
    try {
      const response = await axios.delete(
        `${backendUrl}/product/delete-product/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Product removed successfully!");
        setProducts(products.filter((product) => product._id !== productId));
        setFilteredProducts(filteredProducts.filter((product) => product._id !== productId));
      } else {
        toast.error("Failed to remove product");
      }
    } catch (error) {
      toast.error("Error occurred while removing product. Try again.");
    }
  };

  const handleSearch = (query) => {
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
    setFilteredProducts(filtered);
  };

  return (
    <div className="admin-layout">
      <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
        <Menu size={24} />
      </button>

      <aside className={`admin-sidebar ${showSidebar ? "show" : ""}`}>
        <ul>
          {["", "electronics", "fashion", "home appliances", "beauty", "toys"].map((cat) => (
            <li key={cat}>
              <button
                onClick={() => handleCategoryChange(cat)}
                className={selectedCategory === cat ? "active" : ""}
              >
                {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : "All"}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="admin-content">
        <div className="admin-header">
          <h2>Product List</h2>
          <SearchBox onSearch={handleSearch} />
          <Link to="/add-product">
            <button className="btn-add">Add Product</button>
          </Link>
        </div>

        {loading ? (
          <div className="loader-container">
            <SyncLoader color="#4b2c35" />
          </div>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="product-list">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="admin-first">
                  <img src={`${backendUrl}/${product.images?.[0]}`} alt={product.name} />
                  <h3 className="admin-product-name">{product.name}</h3>
                </div>
                <div className="admin-second">
                  <p className="admin-product-price">{product.price.toFixed(2)}</p>
                  <p className="admin-product-stock">Stock: {product.stock}</p>
                </div>
                <div className="actions">
                  <button className="btn-edit" onClick={() => navigate(`/edit-product/${product._id}`)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
