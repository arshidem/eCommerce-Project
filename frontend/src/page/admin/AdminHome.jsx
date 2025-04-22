import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import "../../css/admin/AdminHome.css"; // Import CSS file
import { SyncLoader } from "react-spinners";

const AdminHome = () => {
  const { backendUrl,getAdminAuthState } = useContext(AppContext);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDashboardData = async () => {
      try {
        await getAdminAuthState()
        const [dashboardResponse, usersResponse] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/dashboard`),
          axios.get(`${backendUrl}/api/user/users`),
        ]);

        setStats({
          totalOrders: dashboardResponse.data.totalOrders,
          todayOrders: dashboardResponse.data.todayOrders,
          totalEarnings: dashboardResponse.data.totalEarnings,
          todayEarnings: dashboardResponse.data.todayEarnings,
          totalUsers: usersResponse.data.users.length,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminDashboardData();
  }, [backendUrl]);

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/admin-auth/logout`, {}, { withCredentials: true });

      localStorage.removeItem("authToken"); // Clear auth token
      window.location.href = "/admin"; // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="loader-container">
        <SyncLoader color="#4b2c35" />
      </div>
    );
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      {/* Logout Button */}
      <button className="admin-logout-button" onClick={handleLogout}>
        Logout
      </button>

      <h2>Admin Dashboard</h2>
      <div className="dashboard-metrics">
        {[
          { label: "Total Orders", value: stats.totalOrders },
          { label: "Today's Orders", value: stats.todayOrders },
          { label: "Total Earnings", value: `₹${stats.totalEarnings}` },
          { label: "Earnings Today", value: `₹${stats.todayEarnings}` },
          { label: "Total Users", value: stats.totalUsers },
        ].map((metric, index) => (
          <div key={index} className="metric-card">
            <h3>{metric.label}</h3>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
