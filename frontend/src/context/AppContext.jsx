import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Authentication states
  const [isLoggedin, setLoggedin] = useState(false);
  const [userData, setUserData] = useState({});
  const [token, setToken] = useState(localStorage.getItem("userToken") || ""); // User Token
  const [adminToken, setAdminToken] = useState(localStorage.getItem("adminToken") || ""); // Admin Token

  // Admin authentication states
  const [adminIsLoggedin, setAdminIsLoggedin] = useState(false);
  const [adminData, setAdminData] = useState({});

  // Cart item count
  const [cartItemCount, setCartItemCount] = useState(0);

  // User authentication state
  const getAuthState = async () => {
    try {
      if (!token) return; // Skip API call if no token is found

      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setLoggedin(true);
        await getUserData();
      } else {
        setLoggedin(false);
        localStorage.removeItem("userToken");
      }
    } catch (error) {
      console.error("User Authentication error:", error);
      setLoggedin(false);
      localStorage.removeItem("userToken");
    }
  };

  // Fetch user data
  const getUserData = async () => {
    try {
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (data.success) {
        setUserData(data.userData || {});
      } else {
        setLoggedin(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoggedin(false);
    }
  };

  // Admin authentication state
  const getAdminAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin-auth/check-auth`, {
        withCredentials: true, // ✅ Ensure cookies are sent
      });
  
      if (data.success) {
        setAdminIsLoggedin(true);
        setAdminData(data.adminData);
      } else {
        setAdminIsLoggedin(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAdminIsLoggedin(false);
    }
  };
  

  // Fetch admin data
  const getAdminData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/admin-data`, {
        withCredentials: true, // ✅ Required for sending cookies
      });
  
      if (data.success) {
        setAdminData(data.adminData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch admin data.");
    }
  };
  

  const fetchCartItems = async () => {
    if (!userData?.userId) return;
  
    try {
      const response = await axios.get(`${backendUrl}/api/cart/${userData.userId}`);
  
      if (response.data.success && response.data.cart) {
        setCartItemCount(response.data.cart.items.length || 0);
      } else {
        setCartItemCount(0);
      }
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setCartItemCount(0);
    }
  };
  
  
  // Fetch cart items when user logs in
  useEffect(() => {
    if(userData && userData.userId){
      fetchCartItems();
    }
  }, [userData]);
  
  // 🛑 Auto-fetch authentication state when token or adminToken changes
  // useEffect(() => {
  //   if (token) {
  //     getAuthState();
  //   }
  // }, [token]);

  // useEffect(() => {
  //   if (adminToken) {
  //     getAdminAuthState();
  //   }
  // }, [adminToken]);

  // Provide context values
  const value = {
    backendUrl,

    // User Authentication
    isLoggedin, setLoggedin,
    userData, setUserData,
    getUserData,
    getAuthState,
    token, setToken,

    // Admin Authentication
    adminIsLoggedin, setAdminIsLoggedin,
    adminData, setAdminData,
    getAdminData,
    getAdminAuthState,
    adminToken, setAdminToken,

    cartItemCount, setCartItemCount,
    fetchCartItems,

  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
