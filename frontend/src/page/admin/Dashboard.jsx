import React, { useState } from "react";
import { Home, ShoppingBag, List, Users } from "lucide-react"; // Correct icon for users
import AdminHome from "./AdminHome";
import AdminProducts from "./AdminProducts";
import AllOrders from "./AllOrders";
import AllUsers from "./AllUsers";
import "../../css/admin/Dashboard.css"; // Import CSS file

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home"); // Default tab

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <nav className="dashboard-nav">
          <div
            onClick={() => setActiveTab("home")}
            className={`dashboard-nav-item ${activeTab === "home" ? "active" : ""}`}
          >
            <Home size={20} />
            <span>Home</span>
          </div>
          <div
            onClick={() => setActiveTab("products")}
            className={`dashboard-nav-item ${activeTab === "products" ? "active" : ""}`}
          >
            <ShoppingBag size={20} />
            <span>Products</span>
          </div>
          <div
            onClick={() => setActiveTab("orders")}
            className={`dashboard-nav-item ${activeTab === "orders" ? "active" : ""}`}
          >
            <List size={20} />
            <span>Orders</span>
          </div>
          <div
            onClick={() => setActiveTab("users")}
            className={`dashboard-nav-item ${activeTab === "users" ? "active" : ""}`}
          >
            <Users size={20} /> {/* Corrected Icon */}
            <span>Users</span>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeTab === "home" && <AdminHome />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AllOrders />}
        {activeTab === "users" && <AllUsers />}
      </main>
    </div>
  );
};

export default Dashboard;
