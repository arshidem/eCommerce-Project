const express = require('express');
const userAuth = require('../middleware/userAuth');
const { getUserData, updateUserProfile, getAllUsers } = require('../controllers/userController');

const userRouter = express.Router();

// Get user data (protected route)
userRouter.get('/data', userAuth, getUserData);

// Update user profile (protected route)
userRouter.put('/update/:userId', updateUserProfile);
userRouter.get('/users', getAllUsers);



module.exports = userRouter;
