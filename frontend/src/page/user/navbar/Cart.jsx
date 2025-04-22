import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "../../../css/Cart.css";
import { Trash2 } from "lucide-react";
import {SyncLoader} from 'react-spinners'

const Cart = () => {
  const { getAuthState, getUserData, userData, backendUrl, token,isLoggedin } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [products, setProducts] = useState([]); // Store fetched product data with images and stock

  useEffect(() => {
    getAuthState();
    getUserData();
  }, []);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (userData?.userId) {
        try {
          const response = await axios.get(
            `${backendUrl}/api/cart/${userData.userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setCart(response.data.cart.items);
          // console.log(response.data.cart);
        } catch (err) {
          console.error("Error fetching cart:", err);
          setError("Failed to load cart");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCart();
  }, [userData, backendUrl, token]);

  // Fetch products based on cart items' productIds (including stock details)
  useEffect(() => {
    const fetchProducts = async () => {
      if (cart.length > 0) {
        const productIds = cart.map((item) => item.productId._id);
        try {
          const response = await axios.get(
            `${backendUrl}/product/admin/products`,
            { params: { productIds } }
          );
          setProducts(response.data.products); // Store product data with images and stock details
        } catch (err) {
          console.error("Error fetching products:", err);
          setError("Failed to load products");
        }
      }
    };

    fetchProducts();
  }, [cart, backendUrl]);

  // Calculate the total price of items in the cart
  useEffect(() => {
    const newTotal = cart.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );
    setTotalPrice(newTotal);
  }, [cart]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/remove`,
        { userId: userData.userId, productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCart((prevCart) =>
          prevCart.filter((item) => item.productId._id !== productId)
        );
        toast.success("Item removed from cart.");
      } else {
        toast.error("Failed to remove item from cart.");
      }
    } catch (err) {
      console.error("Error removing item from cart:", err);
      toast.error("Error occurred while removing item.");
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/cart/clear/${userData.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setCart([]); // Empty cart
        toast.success("Cart cleared successfully.");
      } else {
        toast.error("Failed to clear cart.");
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      toast.error("Error occurred while clearing the cart.");
    }
  };

  // Check product stock and handle increase quantity
  const handleIncreaseQuantity = async (productId, currentQuantity) => {
    const product = products.find((p) => p._id === productId);
    if (product && currentQuantity < product.stock) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/increase`,
          { userId: userData.userId, productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.productId._id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          toast.error("Failed to increase quantity.");
        }
      } catch (error) {
        console.error("Error increasing quantity:", error);
        toast.error("Failed to increase quantity.");
      }
    } else {
      toast.error("Not enough stock available to increase quantity.");
    }
  };

  // Handle decrease quantity and ensure stock check
  const handleDecreaseQuantity = async (productId, currentQuantity) => {
    const product = products.find((p) => p._id === productId);
    if (currentQuantity > 1 && product) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/decrease`,
          { userId: userData.userId, productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setCart((prevCart) =>
            prevCart.map((item) =>
              item.productId._id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
          );
        } else {
          toast.error("Failed to decrease quantity.");
        }
      } catch (error) {
        console.error("Error decreasing quantity:", error);
        toast.error("Failed to decrease quantity.");
      }
    } else {
      toast.error("Cannot decrease quantity below 1.");
    }
  };

  const handleCheckout = () => {
    for (let item of cart) {
      const product = products.find((p) => p._id === item.productId._id);
      if (product && item.quantity > product.stock) {
        toast.error(
          `Not enough stock for ${product.name}. Only ${product.stock} available.`
        );
        return; // Stop the checkout if stock is insufficient
      }
    }

    toast.info("Redirecting to checkout...");
    navigate("/checkout");
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={handleBack} className="back-btn">←</button>
        <h2 className="cart-title">Your Cart</h2>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="cart-container">
        {loading ? (
          <div className="loader-container">
            <SyncLoader color="#4b2c35" />
          </div>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : !isLoggedin ? (
          // Show this when user is not logged in
          <div className="empty-cart-container">
            <p>You are not logged in to see the cart. Please log in and browse products.</p>
            <button className="browse-products-btn" onClick={() => navigate("/signin")}>
              Sign In
            </button>
          </div>
        ) : cart.length === 0 ? (
          // Show this when cart is empty
          <div className="empty-cart-container">
            <p>Your cart is empty</p>
            <button className="browse-products-btn" onClick={() => navigate("/")}>
              Browse Products
            </button>
          </div>
        ) : (
          <div>
            <ul className="cart-list">
              {cart.map((item) => {
                const product = products.find((p) => p._id === item.productId._id);
                const imageUrl =
                  product?.images?.length > 0
                    ? `${backendUrl}/${product.images[0]}`
                    : "/placeholder-image.jpg";
  
                return (
                  <li key={item.productId._id} className="cart-item">
                    <div className="cart-image">
                      <img src={imageUrl} alt={product?.name} className="cart-item-image" />
                    </div>
                    <div className="cart-first">
                      <h3 className="cart-item-name">{product?.name}</h3>
                      <p className="cart-item-price">₹{product?.price}</p>
                    </div>
                    <p className="price-quantity">₹{product?.price * item.quantity}</p>
                    <div className="cart-second">
                      <span className="quantity-adjust">
                        <button
                          className="quantity-btn-decr"
                          onClick={() => handleDecreaseQuantity(item.productId._id, item.quantity)}
                        >
                          -
                        </button>
                        <span className="cart-item-quantity">{item.quantity}</span>
                        <button
                          className="quantity-btn-incr"
                          onClick={() => handleIncreaseQuantity(item.productId._id, item.quantity)}
                        >
                          +
                        </button>
                      </span>
                      <Trash2
                        onClick={() => handleRemoveItem(item.productId._id)}
                        size={20}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
  
            <h3 className="cart-total">Total Amount: ₹{totalPrice.toFixed(2)}</h3>
  
            <button className="clear-cart-btn" onClick={handleClearCart}>Clear Cart</button>
            <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
  
  
};

export default Cart;
