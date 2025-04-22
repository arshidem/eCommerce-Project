import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import "../../css/admin/OrderDetails.css"; // Import external CSS file

const OrderDetails = () => {
  const { orderId } = useParams();
  const { backendUrl, adminIsLoggedin, getAdminAuthState } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("");

  // ✅ Check admin authentication before fetching order details
  useEffect(() => {
    const checkAdminAuth = async () => {
      await getAdminAuthState();
      if (!adminIsLoggedin) {
        navigate("/admin"); // Redirect if admin is not logged in
      }
    };
    checkAdminAuth();
  }, [adminIsLoggedin, getAdminAuthState, navigate]);

  useEffect(() => {
    if (!adminIsLoggedin) return; // Prevent fetching if not authenticated

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/order/${orderId}`);
        if (response.data) {
          setOrder(response.data);
          setDeliveryStatus(response.data.deliveryStatus || "Pending");
        } else {
          setError("Failed to load order details.");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Error fetching order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [backendUrl, orderId, adminIsLoggedin]);

  const updateDeliveryStatus = async (newStatus) => {
    try {
      const response = await axios.put(`${backendUrl}/api/status/${orderId}`, {
        deliveryStatus: newStatus,
      });

      if (response.status === 200) {
        setDeliveryStatus(newStatus);
      }
    } catch (err) {
      console.error("Error updating delivery status:", err);
      alert("Failed to update delivery status.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-details-container">
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button onClick={() => navigate(-1)} className="back-btn">←</button>
        <h2 className="order-title">Order Details</h2>
      </div>

      {order && (
        <div className="order-content">
          <p><strong>Order ID:</strong> {order.orderId}</p>
          <p><strong>Customer Name:</strong> {order.userName}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Phone:</strong> {order.address.phone}</p>
          <p><strong>Amount:</strong> ₹{order.totalAmount}</p>
          <p><strong>Status:</strong> {order.paymentDetails?.status || "N/A"}</p>

          <div className="delivery-status">
            <label><strong>Delivery Status:</strong></label>
            <select
              className="status-dropdown"
              value={deliveryStatus}
              onChange={(e) => updateDeliveryStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <h3 className="section-title">Address</h3>
          <p className="address">
            {order.address.houseNo}, {order.address.city}, {order.address.state} - {order.address.pin}
          </p>
          
          <h3 className="section-title">Items</h3>
          <ul className="item-list">
            {order.cartItems.map((item) => (
              <li key={item._id} className="item">
                {item.name} (Qty: {item.quantity}, Price: ₹{item.price})
              </li>
            ))}
          </ul>

          <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
