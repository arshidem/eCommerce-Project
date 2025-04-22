const mongoose = require('mongoose');

// Define the Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,  // Trims any whitespace around the name
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,  // Ensure the price is non-negative
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  images: [
    {
      type: String,  // Array of image URLs
    },
  ],
  stock: {
    type: Number,
    required: true,
    min: 0,  // Ensure stock is not negative
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      review: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,  // Timestamp for each review
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set to current date
  },
  updatedAt: {
    type: Date,
    default: Date.now,  // Automatically set to current date
  },
});

// Update the `updatedAt` field before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();  // Set the `updatedAt` field to the current time
  next();
});

// Create and export the Product model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
