import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AiOutlineSearch } from "react-icons/ai"; // Import search icon
import "../../../css/SearchBox.css";
import { AppContext } from "../../../context/AppContext";
const SearchBox = ({ onSearch }) => {
  const { backendUrl } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Fetch product list from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/product/admin/products`);
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [backendUrl]);

  // Filter products as user types
  useEffect(() => {
    if (query.length > 0) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  }, [query, products]);

  // Handle search input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestions(false);
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (name) => {
    setQuery(name);
    setShowSuggestions(false);
    onSearch(name);
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-box-container" ref={searchRef}>
      <input
        className="search"
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={handleInputChange}
      />
      <button className="search-button" onClick={handleSearchClick}>
        <AiOutlineSearch className="search-icon" /> {/* Search icon here */}
      </button>

      {showSuggestions && filteredProducts.length > 0 && (
        <ul className="suggestions-list">
          {filteredProducts.map((product) => (
            <li key={product._id} onClick={() => handleSelectSuggestion(product.name)}>
              {product.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
