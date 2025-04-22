const express = require('express');
const userAdminAuthRouter = express.Router();

// Import controllers for both user and admin authentication
const { 
    register, 
    signin, 
    logout, 
    sendVerifyOtp, 
    verifyEmail, 
    isAuthenticated, 
    sendResetOtp, 
    resetPassword,
    adminSignin, 
    adminLogout, 
    isAdminAuthenticated, 
    verifyResetOtp
} = require('../controllers/userAdminAuth');

// Import authentication middleware for user and admin
const userAuth = require('../middleware/userAuth');
const adminAuth = require('../middleware/adminAuth');

// ------------------ User Authentication Routes ------------------

// User registration
userAdminAuthRouter.post('/register', register); 

// User sign-in
userAdminAuthRouter.post('/signin', signin); 

// User logout
userAdminAuthRouter.post('/logout', logout); 

// Send verification OTP for user
userAdminAuthRouter.post('/send-verify-otp', sendVerifyOtp); 

// Verify user email
userAdminAuthRouter.post('/account', verifyEmail); 

// Check if user is authenticated
userAdminAuthRouter.get('/is-auth', userAuth, isAuthenticated); 

// Send reset password OTP
userAdminAuthRouter.post('/send-reset-otp', sendResetOtp); 

// verify rest otp
userAdminAuthRouter.post('/verify-reset-otp', verifyResetOtp); 


// Reset user password
userAdminAuthRouter.post('/reset-password', resetPassword); 

// ------------------ Admin Authentication Routes ------------------

// Admin sign-in
userAdminAuthRouter.post('/', adminSignin); 

// Admin logout
userAdminAuthRouter.post('/logout', adminLogout); 

// Check if admin is authenticated
userAdminAuthRouter.get('/check-auth', adminAuth, isAdminAuthenticated); 

// Export the router
module.exports = userAdminAuthRouter // For both user and admin authentication routes

