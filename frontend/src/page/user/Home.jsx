import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "../../css/Home.css";
import electronics from "../../assets/images/electronics.jpg";
import homeAppliances from "../../assets/images/homeAppliances.jpg";
import beauty from "../../assets/images/beauty.jpg";
import fashion from "../../assets/images/fashion.jpg";
import toys from "../../assets/images/toys.jpg";
import all from "../../assets/images/All.jpg";
import { SyncLoader } from "react-spinners";

const Home = () => {
  const { token, userData, getUserData, backendUrl, getAuthState, cartItemCount, fetchCartItems,isLoggedIn } = useContext(AppContext);
  
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clickedImage, setClickedImage] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [cartStatus, setCartStatus] = useState({});

  useEffect(() => {
   
        getAuthState();
        getUserData();
        fetchCartItems();
    
}, [isLoggedIn, cartItemCount]);


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendUrl}/product/products?category=${selectedCategory}`);
        const data = await response.json();

        const availableProducts = data.filter((product) => product.stock > 0);
        setProducts(availableProducts);
        if (availableProducts.length === 0) setError("No products available in this category.");
      } catch (error) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, backendUrl]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category || "all");
  };

  const handleAddToCart = async (productId) => {
    await getAuthState();
    await getUserData();

    if (!userData?.userId || !token) {
      toast.error("You must be logged in to add items to the cart.");
      return;
    }

    setCartStatus((prev) => ({ ...prev, [productId]: "loading" }));

    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { userId: userData.userId, productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Product added to your cart!");
        setCartStatus((prev) => ({ ...prev, [productId]: "added" }));
        fetchCartItems(); // Fetch updated cart items
      } else {
        throw new Error(response.data.message || "Failed to add product to cart.");
      }
    } catch (error) {
      toast.error("Error occurred while adding to cart.");
      setCartStatus((prev) => ({ ...prev, [productId]: "error" }));
    }
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "lowToHigh") return a.price - b.price;
    if (sortOrder === "highToLow") return b.price - a.price;
    return 0;
  });

  return (
    <div className="home-container">
      <Navbar onSearch={setSearchTerm} />
      <div className="layout">
        <aside className="categories">
          <ul>
            {[{ name: "", src: all }, { name: "Electronics", src: electronics }, { name: "Fashion", src: fashion }, { name: "Home Appliances", src: homeAppliances }, { name: "Beauty", src: beauty }, { name: "Toys", src: toys }].map((category, index) => (
              <li key={index} onClick={() => handleCategoryChange(category.name.toLowerCase())}>
                <img
                  src={category.src}
                  alt={category.name}
                  className={clickedImage === index ? "category-img clicked" : "category-img"}
                  onClick={() => setClickedImage(index)}
                  tabIndex="0"
                />
                <p style={{ textAlign: "center" }}>{category.name}</p>
              </li>
            ))}
          </ul>
        </aside>

        <main className="content">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-dropdown">
            <option value="default">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>

          {loading ? (
            <div className="loader-container">
              <SyncLoader color="#4b2c35" />
            </div>
          ) : error ? (
            <p className="error">{error}</p>
          ) : sortedProducts.length === 0 ? (
            <p className="no-products">No products found.</p>
          ) : (
            <div className="products">
              {sortedProducts.map((product) => (
                <div className="product" key={product._id}>
                  <div className="first1">
                    <Link to={`/product/${product._id}`} className="product-link">
                      <img src={product.images?.length > 0 ? `${backendUrl}/${product.images[0]}` : "/placeholder-image.jpg"} alt={product.name} className="product-image" />
                    </Link>
                  </div>
                  <div className="second2">
                    <h3 className="p-name">{product.name}</h3>
                    <div className="third3">
                      <p className="p-price">₹{product.price}</p>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={cartStatus[product._id] === "loading" || cartStatus[product._id] === "added"}
                        className={`product-button ${cartStatus[product._id] === "added" ? "added" : ""}`}
                      >
                        {cartStatus[product._id] === "loading" ? "Adding..." : cartStatus[product._id] === "added" ? "Added ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
