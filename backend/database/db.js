const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit the process if DB connection fails
  }
};

module.exports = connectDB; // Export the function
