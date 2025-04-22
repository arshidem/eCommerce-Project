import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import SearchBox from "../page/user/navbar/SearchBox";
import UserSlidebar from "../page/user/navbar/UserSlidebar";
import "../css/Navbar.css";
import cart from "../assets/images/navbar/cart.png";

const Navbar = ({ onSearch }) => {
  const { cartItemCount, setCartItemCount, userData, isLoggedin } = useContext(AppContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Reset cart count when the user logs out
  useEffect(() => {
    if (isLoggedin) {
    } else {
      setCartItemCount(0);
    }
  }, [isLoggedin,setCartItemCount]); 
  
  
  

  return (
    <>
      <nav className="navbar">
        <div className="first">
          <Link to={"/"} className="logo-link">
            <img src={assets.logo} alt="Logo" className="logo" />
          </Link>
        </div>
        <div className="second">
          <SearchBox onSearch={onSearch} className="search-bar" />
        </div>
        <div className="third">
          <Link to={"/cart"} className="cart-link">
            <p className="cart-text">
              <img className="imgCart" src={cart} alt="Cart" />
              {isLoggedin && cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </p>
          </Link>

          {/* Conditional rendering for user authentication */}
          {isLoggedin ? (
            <div
              className="user-name"
              onClick={toggleSidebar}
              style={{ cursor: "pointer" }}
              aria-label="Toggle sidebar"
            >
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
          ) : (
            <div className="signin-navbar">
              <Link className="signin-li" to="/signin">
                <p className="signin-btn">Sign In</p>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <UserSlidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      )}
    </>
  );
};

export default Navbar;
