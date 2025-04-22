import React, { useEffect, useState, useContext } from "react";
import { useParams,useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import Slider from "react-slick";
import "../../../css/ProductDetails.css"; // Import CSS file
import { SyncLoader } from "react-spinners";
const ProductDetails = () => {
  const { getUserData, userData, backendUrl, getAuthState, token } =
    useContext(AppContext);
    const navigate=useNavigate()
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartStatus, setCartStatus] = useState("idle");
  const [reviews, setReviews] = useState([]); // Store product reviews
  const [reviewForm, setReviewForm] = useState({ review: "" });
  const [submitting, setSubmitting] = useState(false);
  // console.log(userData);

  useEffect(() => {
    getAuthState();
    getUserData();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/product/products/${id}`
        );
        setProduct(response.data.product);
        setReviews(response.data.product.reviews || []); // Store existing reviews
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, backendUrl]);

  const handleAddToCart = async () => {
    if (!userData?.userId || !token) {
      toast.error("You must be logged in to add items to the cart.");
      return;
    }

    setCartStatus("loading");
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { userId: userData.userId, productId: id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Product added to your cart! 🛒");
        setCartStatus("added");
      } else {
        toast.error("Failed to add product to cart.");
        setCartStatus("idle");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error occurred while adding to cart.");
      setCartStatus("idle");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const productId = id;
      try {
        const response = await axios.get(`${backendUrl}/reviews/${productId}`);
        if (response.data.success) {
          setReviews(response.data.reviews);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [id, backendUrl]);

  const handleReviewChange = (e) => {
    setReviewForm({ review: e.target.value });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userData?.name) {
      toast.error("You must be logged in to leave a review.");
      return;
    }
    setSubmitting(true);
    
    const productId = id; // Get the product ID from URL params

    try {
      const response = await axios.post(
        `${backendUrl}/reviews/${productId}/add`,
        {
          name: userData.name, // Ensure the name is passed automatically
          review: reviewForm.review, // Only send the review from the form
        }
      );

      if (response.status === 200) {
        toast.success("Review added successfully!");
        setReviews([
          ...reviews,
          { name: userData.name, review: reviewForm.review },
        ]); // Update the UI with new review
        setReviewForm({ review: "" }); // Reset only the review field
      } else {
        toast.error("Failed to add review.");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Error submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  const settings1 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // Adjust this for how many reviews you want visible at a time
    slidesToScroll: 1,
    autoplay: true,
  };
  const handleBack = () => {
    navigate(-1); // Navigate to the previous page
  };
  return (
    <div className="product-details-container">
           <button onClick={handleBack} className="back-btn">←</button>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="product-details">
        {loading ? (
            <div className="loader-container">
            <SyncLoader color="#4b2c35" />
          </div>  
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <div className="product-info">
            {/* Image Carousel */}
            {product.images && product.images.length > 0 ? (
              <div className="firstf">
                <Slider {...settings}>
                  {product.images.map((img, index) => (
                    <div key={index}>
                      <img
                        src={`${backendUrl}/${img}`}
                        alt={`Product Image ${index + 1}`}
                        className="product-image"
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <img
                src="/placeholder-image.jpg"
                alt="No Image Available"
                className="product-image"
              />
            )}
            <div className="seconds">
              <div className="s1">
                <h2 className="pdct-name">{product.name}</h2>
                <p className="product-description">{product.description}</p>
              </div>
              <div className="s2">
                <p style={{ fontSize: "30px" }} className="pdct-price">
                  ₹{product.price}
                </p>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`add-to-cart-btn ${
                    cartStatus === "loading" ? "loading" : ""
                  } ${cartStatus === "added" ? "added" : ""}`}
                  disabled={cartStatus === "loading" || cartStatus === "added"}
                >
                  {cartStatus === "loading"
                    ? "Adding..."
                    : cartStatus === "added"
                    ? "Added ✓"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}



        {/* Reviews Section - Slider for Reviews */}
        <div className="reviews-section">
    <h2>Customer Reviews</h2>
    {reviews.length > 0 ? (
      <div className="review-slider">
        <Slider {...settings1}>
          {reviews.map((review, index) => (
            <div key={index} className="review-card">
              <h4>{review.name}</h4>
              <p>{review.review}</p>
            </div>
          ))}
        </Slider>
      </div>
    ) : (
      <p>No reviews yet. Be the first to review!</p>
    )}
  </div>

        {/* Review Form */}
        <h2>Add a Review</h2>
        <form onSubmit={submitReview} className="review-form">
          <div className="form-group">
            <label htmlFor="review">Your Review</label>
            <textarea
              id="review"
              name="review"
              value={reviewForm.review}
              onChange={handleReviewChange}
              required
              className="input-field"
              rows="4"
            />
          </div>
          <button type="submit" className="submit-review-btn" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;
