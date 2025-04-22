import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import "../../../css/UserOrders.css";

const UserOrders = () => {
  const { userData, backendUrl, getAuthState, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAuthState();
    getUserData();
  }, []);

  useEffect(() => {
    if (!userData?.userId) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/orders/${userData.userId}`,
          {
            headers: { Authorization: `Bearer ${userData.token}` },
          }
        );

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // If 404 (no orders found), just set an empty array and don't log error
          setOrders([]);
        } else {
          console.error("Error fetching orders:", err);
          setError("Failed to fetch orders");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userData, backendUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (orders.length > 0) {
        const productIds = orders.flatMap((order) =>
          order.cartItems.map((item) => item.productId)
        );

        try {
          const response = await axios.get(
            `${backendUrl}/product/admin/products`,
            {
              params: { productIds: productIds.join(",") },
            }
          );
          setProducts(response.data.products);
        } catch (err) {
          console.error("Error fetching products:", err);
          setError("Failed to load products");
        }
      }
    };

    fetchProducts();
  }, [orders, backendUrl]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );

  if (error && error !== "No orders yet.") {
    return <p className="error-text">{error}</p>;
  }

  return (
    <div className="orders-container">
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button onClick={handleBack} className="back-btn">
          ←
        </button>
        <h2 className="orders-title">Your Orders</h2>
      </div>
      {orders.length === 0 ? (
        <h3 className="no-orders">No orders yet.</h3>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <input
                type="checkbox"
                id={`order-${order._id}`}
                className="order-toggle"
              />
              <label htmlFor={`order-${order._id}`} className="order-summary">
                <div className="order-main-info">
                  <div className="order-items-preview">
                    <div>
                    {order.cartItems.map((item) => {
                      const product = products.find(
                        (p) => p._id === item.productId
                      );
                      const imageUrl =
                        product?.images?.length > 0
                          ? `${backendUrl}/${product.images[0]}`
                          : "/placeholder-image.jpg";
                      return (
                        <img
                          key={item.productId}
                          src={imageUrl}
                          alt={product?.name || "Product"}
                          className="order-item-image"
                        />
                      );
                    })}
                    </div>
                    <p
                      className={`order-delivery-status ${order.deliveryStatus.toLowerCase()}`}
                    >
                      {order.deliveryStatus}
                    </p>
                  </div>

                  <p className="order-total">Total: ₹{order.totalAmount}</p>
                </div>
              </label>
              <div className="order-details">
                <p className="order-id">Order ID: {order._id}</p>
                <p className="order-date">
                  Order Date: {new Date(order.createdAt).toLocaleString()}
                </p>
                <ul>
                  {order.cartItems.map((item) => {
                    const product = products.find(
                      (p) => p._id === item.productId
                    );
                    return (
                      <li key={item.productId} className="order-item-detail">
                        <span>{product?.name || "Unknown Product"}</span>
                        <span>
                          {item.quantity} x ₹{item.price}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
