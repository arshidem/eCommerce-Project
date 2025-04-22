const { log } = require('console');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, category, stock } = req.body;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Update the product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    // Handle image uploads if they exist in the request
    if (req.files && req.files.length > 0) {
      // Ensure that exactly 3 images are uploaded
      if (req.files.length !== 3) {
        return res.status(400).json({
          success: false,
          message: 'You must upload exactly 3 images',
        });
      }

      // Delete the old images from the server
      product.images.forEach((image) => {
        const imagePath = path.join(__dirname, '..', 'uploads', image.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Delete the old image from the server
        }
      });

      // Save new images to the server
      const newImages = req.files.map((file) => ({
        filename: file.filename,
        url: `/uploads/${file.filename}`, // Assuming the server serves the images from 'uploads' directory
      }));

      // Set the product's images to the newly uploaded images
      product.images = newImages;
    }

    // Save the updated product
    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  } finally {
    // Cleanup: Delete temporary image files from the server
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path)); // Remove temporary image files
    }
  }
};

const removeProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if the images array exists and has elements
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        // Check if the image object has a valid 'filename' property
        const imagePath = image.filename
          ? path.join(__dirname, '..', 'uploads', image.filename)
          : null;

        // Only proceed with file deletion if imagePath is valid
        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath); // Remove the image file from the server
        }
      });
    }

    // Delete the product from the database
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Product and its images removed successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Error removing product',
      error: error.message,
    });
  }
};

// Function to handle adding a product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Ensure exactly 3 images are uploaded
    if (req.files.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'You must upload exactly 3 images',
      });
    }

    // Get the uploaded image paths
    const imagePaths = req.files.map(file => file.path);

    // Create a new product
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      images: imagePaths,
      stock,
    });

    // Save the product in the database
    await newProduct.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully with images',
      product: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// Function to fetch all products
const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let products;

    // If a category is provided, filter by category, otherwise return all products
    if (category && category !== 'all') {
      // Optional: Validate category if needed
      const validCategories = ['electronics', 'fashion', 'home appliances', 'beauty', 'toys'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Invalid category' });
      }

      products = await Product.find({ category: category });
    } else {
      // Return all products if no category or 'all' is selected
      products = await Product.find();
    }

    // Send the products as a response
    res.status(200).json(products);
  } catch (err) {
    // Handle errors
    console.error(err); // Log error to the server console
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

const adminProducts=async(req,res)=>{
  try{
    const products = await Product.find(); // Fetch all products
    return res.status(200).json({success: true, message: 'Products fetched successfully', products,
    });
  } catch (error) {
    return res.status(500).json({ success: false,message: 'Error fetching products',error: error.message,
    });
  }
}



const getProductById = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.status(200).json({ success: true, product });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching product',
        error: error.message,
      });
    }
  };

  const decreaseProductStock = async (req, res) => {
    const { products } = req.body; // [{ productId, quantity }, { productId, quantity }]
    console.log(products);
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid products array." });
    }
  
    try {
      // Loop through each product and decrease its stock
      for (const { productId, quantity } of products) {
        // Validate the productId and quantity
        if (!productId || !quantity || isNaN(quantity) || quantity <= 0) {
          return res.status(400).json({ error: "Invalid productId or quantity." });
        }
  
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ error: `Product with ID ${productId} not found.` });
        }
  
        // Ensure sufficient stock is available
        if (product.stock < quantity) {
          return res.status(400).json({ error: `Not enough stock for product ${product.name}` });
        }
  
        // Decrease stock
        product.stock -= quantity;
  
        // Save updated product stock
        await product.save();
      }
  
      // Respond with success message
      res.status(200).json({ success: true, message: 'Stock updated successfully.' });
    } catch (error) {
      console.error("Error decreasing stock:", error.message);
      res.status(500).json({ error: 'Failed to update stock.' });
    }
  };
  
 
  
  
  
  

module.exports = { addProduct,updateProduct, getProducts, getProductById,removeProduct,adminProducts,decreaseProductStock  };
