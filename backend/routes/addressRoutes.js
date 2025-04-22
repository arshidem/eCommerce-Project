const express = require('express');
const addressRouter = express.Router();
const { createAddress, getAddresses, getAddress, updateAddress, deleteAddress } = require('../controllers/addressController');

// Create a new address
addressRouter.post('/addresses', createAddress);

// Get all addresses for a user
addressRouter.get('/addresses/:userId', getAddresses);

// Get a specific address by ID
addressRouter.get('/address/:addressId', getAddress);

// Update an address
addressRouter.put('/address/:addressId', updateAddress);

// Delete an address
addressRouter.delete("/address/:addressId", deleteAddress);

module.exports = addressRouter;
