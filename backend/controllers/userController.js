const userModel = require('../models/User');  // Import User model

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await userModel.find();  // You can add .select() to limit fields if needed

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    // Map through the users to return relevant data
    const userData = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }));

    res.json({
      success: true,
      users: userData,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};





const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;  // Or req.query if using GET requests

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(200).json({ success: false, message: 'User Not Found' });
    }

    res.json({
      success: true,
      userData: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params; // Get userId from request params
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if another user already has this phone number
    const existingUser = await userModel.findOne({ phone });

    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ success: false, message: "Phone number already in use by another user" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true } // Return the updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: {
        userId: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};


module.exports = { getUserData, updateUserProfile,getAllUsers };
