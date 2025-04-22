import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";
import { SyncLoader } from "react-spinners";
import axios from "axios";
import "../../css/admin/AllOrders.css";

const Orders = () => {
  const { backendUrl } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/orders/get`);
        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError(response.data.message || "No orders found.");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Error fetching orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [backendUrl]);

  // Get today's date in YYYY-MM-DD format
  const todayDateString = new Date().toISOString().split("T")[0];

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
    return orderDate === todayDateString;
  });

  if (loading) {
    return (
      <div className="loader-container">
        <SyncLoader color="#4b2c35" />
      </div>
    );
  }

  if (error) {
    return <div className="error-alert"><p>{error}</p></div>;
  }

  return (
    <div className="orders-container">
      <OrderSection title="Today's Orders" orders={todayOrders} emptyMessage="No orders today." />
      <OrderSection title="All Orders" orders={orders} emptyMessage="No orders yet." />
    </div>
  );
};

const OrderSection = ({ title, orders, emptyMessage }) => (
  <>
    <h2 className="orders-title">{title}</h2>
    {orders.length === 0 ? (
      <p className="no-orders">{emptyMessage}</p>
    ) : (
      <div className="table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td><Link to={`/order-details/${order.orderId}`}>{order.orderId}</Link></td>
                <td>{order.userName}</td>
                <td>{order.address.phone}</td>
                <td>₹{order.totalAmount.toLocaleString()}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

export default Orders;
