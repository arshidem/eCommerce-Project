const Product = require('../models/Product'); // Import the Product model
const addReview = async (req, res) => {
  try {
    const { productId } = req.params; // Get productId from URL parameters
    const { name, review } = req.body; // Get name and review from request body

    // Validate request data
    if (!name || !review) {
      return res.status(400).json({ message: "Name and review are required." });
    }

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Create a new review object
    const newReview = {
      name,
      review,
      createdAt: new Date(),
    };

    // Add the review to the product's reviews array
    product.reviews.push(newReview);
    product.updatedAt = Date.now(); // Update `updatedAt` field

    // Save the updated product
    await product.save();

    res.status(200).json({ message: "Review added successfully!", product });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// Get Reviews for a Specific Product
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product and populate its reviews
    const product = await Product.findById(productId).select("reviews");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, reviews: product.reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




module.exports = { addReview ,getReviews};
