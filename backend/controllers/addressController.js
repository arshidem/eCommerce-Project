const AddressModel = require('../models/Address')

// Create a new address
const createAddress = async (req, res) => {
    try {
      const { userId, firstName, lastName, houseNo, city, state, pin, phone, isDefault } = req.body;
  
      // Check if all required fields are provided
      if (!userId || !firstName || !lastName  || !houseNo || !city || !state || !pin || !phone) {
        return res.status(400).json({ success: false, message: "All fields are required" });
      }
  
    
  
     
  
      // Check if any address is already marked as default (if isDefault is true)
      if (isDefault) {
        const existingDefault = await AddressModel.findOne({ userId, isDefault: true });
        if (existingDefault) {
          return res.status(400).json({ success: false, message: "You already have a default address. Please remove it to set a new default." });
        }
      }
  
      // Create the new address
      const newAddress = new AddressModel({
        userId,
        firstName,
        lastName,
        houseNo,
        city,
        state,
        pin,
        phone,
        isDefault: isDefault || false, // Default to false if not provided
      });
  
      // Save the address
      await newAddress.save();
      res.status(201).json({ success: true, message: "Address added successfully", address: newAddress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error creating address", error: error.message });
    }
  };
  
  

// Get all addresses for a user
const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await AddressModel.find({ userId });
    if (addresses.length === 0) {
      return res.status(200).json({ success: true, message: "No addresses found" });
    }

    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching addresses", error: error.message });
  }
};

// Get a single address by address ID
const getAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await AddressModel.findById(addressId);
    if (!address) {
      return res.status(200).json({ success: true, message: "Address not found" });
    }

    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching address", error: error.message });
  }
};

// Update an address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { userId, firstName, lastName, houseNo, city, state, pin, phone, isDefault } = req.body;
    // Check if all required fields are provided
    if (!userId || !firstName || !lastName || !houseNo || !city || !state || !pin || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Find the address to update
    const updatedAddress = await AddressModel.findById(addressId);
    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    // Ensure the address belongs to the user (authorization check)
    if (updatedAddress.userId.toString() !== userId) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this address" });
    }

    // If isDefault is true, check if any address is already marked as default
    if (isDefault && updatedAddress.isDefault !== isDefault) {
      const existingDefault = await AddressModel.findOne({ userId, isDefault: true });
      if (existingDefault) {
        return res.status(400).json({ success: false, message: "You already have a default address. Please remove it to set a new default." });
      }
    }

    // Update the address fields with new values or retain existing values
    updatedAddress.firstName = firstName || updatedAddress.firstName;
    updatedAddress.lastName = lastName || updatedAddress.lastName;
    updatedAddress.houseNo = houseNo || updatedAddress.houseNo;
    updatedAddress.city = city || updatedAddress.city;
    updatedAddress.state = state || updatedAddress.state;
    updatedAddress.pin = pin || updatedAddress.pin;
    updatedAddress.phone = phone || updatedAddress.phone;
    updatedAddress.isDefault = isDefault !== undefined ? isDefault : updatedAddress.isDefault;

    // Save the updated address
    await updatedAddress.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Error updating address", error: error.message });
  }
};



// Delete an address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await AddressModel.findById(addressId);
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await AddressModel.deleteOne({ _id: addressId }); // Updated to deleteOne()
    res.status(200).json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting address", error: error.message });
  }
};

// Ensure correct route prefix


module.exports = { createAddress, getAddresses, getAddress, updateAddress, deleteAddress };
