import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../../../css/User.css'
const UserSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { backendUrl, userData, getUserData, setLoggedin, getAuthState } =
    useContext(AppContext);

  useEffect(() => {
    getAuthState();
    getUserData();
  }, []); // Added dependencies

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/auth/logout`, null, {
        withCredentials: true,
      });

      if (response.data.success) {
        setLoggedin(false);
        await getAuthState(); // Refresh authentication data

        toast.success("Logged out successfully!");
        onClose(); // Close sidebar after logout
        navigate("/");
      
      } else {
        toast.error("Logout failed: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during logout. Please try again.");
    }
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h2 className="userName">Hi, {userData?.name || "User"} 👋</h2>

      <div className="profile-links">
        <Link to="/orders" className="profile-link" onClick={onClose}>
          Orders
        </Link>
        <Link to="/profile" className="profile-link" onClick={onClose}>
          Profile
        </Link>
        <Link to="/cart" className="profile-link" onClick={onClose}>
          Cart
        </Link>
        <Link to="/address" className="profile-link" onClick={onClose}>
          Manage Addresses
        </Link>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>

      </div>

    </div>
  );
};

export default UserSidebar;
