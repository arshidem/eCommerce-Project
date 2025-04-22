const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/User');
const adminModel = require('../models/Admin');
const transporter = require('../config/nodemailer');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
        return res.status(400).json({ success: false, message: 'Missing Details' });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ success: false, message: 'User Already Exists' });
        }
        req.session.tempUser = { name, email, password, phone };

        // Send Welcome Email
      

        res.status(200).json({ success: true, message: 'Welcome email sent. Proceed to verification.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



const signin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and Password Are Required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: false, message: 'Invalid Email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ success: false, message: 'Invalid Password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("Token set in cookie:", token);  // Debugging

        return res.status(200).json({ success: true, message: 'Signed In Successfully', token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.status(200).json({ success: true, message: 'Logged Out' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const sendVerifyOtp = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // ✅ Check if the email is already registered
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email is already registered. Please log in." });
        }

        // ✅ Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpireAt = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        // ✅ Store user temporarily in session before OTP verification
        req.session.tempUser = { name, email, password, phone, otp, otpExpireAt };

        console.log("Sending OTP email to:", email);

        // ✅ Send OTP Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Verify Your Email - OTP",
            text: `Hello ${name},\n\nYour OTP is ${otp}. It expires in 10 minutes.\n\nThank you!`
        };

        console.log("Mail options:", mailOptions);

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info);

        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const verifyEmail = async (req, res) => {
    try {
        console.log("Incoming OTP request:", req.body);

        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        if (!req.session || !req.session.tempUser) {
            console.log("Session missing:", req.session);
            return res.status(401).json({ success: false, message: "Session expired. Please request a new OTP." });
        }

        const tempUser = req.session.tempUser;
        console.log("Session user:", tempUser);

        if (tempUser.email !== email) {
            return res.status(400).json({ success: false, message: "Invalid email." });
        }

        if (parseInt(otp) !== tempUser.otp) {
            return res.status(200).json({ success: false, message: "Incorrect OTP." });
        }

        if (Date.now() > tempUser.otpExpireAt) {
            return res.status(400).json({ success: false, message: "OTP expired." });
        }

        console.log("OTP Verified. Creating user...");

        // Hash password and save user
        const hashedPassword = await bcrypt.hash(tempUser.password, 10);
        const user = new userModel({
            name: tempUser.name,
            email: tempUser.email,
            password: hashedPassword,
            phone: tempUser.phone,
            isAccountVerified: true,
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // ✅ Destroy session after successful verification
        req.session.destroy((err) => {
            if (err) {
                console.error("Error clearing session:", err);
            }
        });

        // ✅ Send welcome email after successful verification
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to Our Platform!",
            text: `Hello ${tempUser.name},\n\nWelcome to our platform! We're excited to have you.\n\nThank you for joining us!\n\nBest regards,\nYour Team`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending welcome email:", err);
            } else {
                console.log("Welcome email sent successfully:", info.response);
            }
        });

        res.status(201).json({
            success: true,
            message: "Email verified successfully!",
            token,
        });

    } catch (error) {
        console.error("Error in verifyEmail:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};




const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: 'Email is Required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 60 * 1000;

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
        };
        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: 'OTP Sent to Your Email' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


const verifyResetOtp = async (req, res) => {
    const { otp,email } = req.body;
console.log(otp,email);


    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Optionally clear OTP after verification
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: "OTP verified, proceed to reset password" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


const resetPassword = async (req, res) => {
    const { newPassword,email } = req.body;
console.log(req.body);

    if (!email) {
        return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    if (!newPassword) {
        return res.status(400).json({ success: false, message: "New password is required" });
    }

    try {
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = "";  // Clear OTP fields
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};





const adminSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // ✅ Generate JWT Token with Admin ID
    const token = jwt.sign(
      { email: admin.email, id: admin._id },  // Store both email and ID
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    // ✅ Store Token in HTTP-Only Cookie
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const isAdminAuthenticated = async (req, res) => {
  const token = req.cookies.adminToken; // ✅ Correct cookie name

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please login." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return res.status(200).json({ 
      success: true, 
      adminEmail: decoded.email,  // ✅ Use email since it's stored
      adminId: decoded.id // ✅ Include ID
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token is invalid or expired" });
  }
};



const adminLogout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
    }
};

module.exports = {
    // User Functions
    register,
    signin,
    logout,
    sendVerifyOtp,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword,
    verifyResetOtp,

    // Admin Functions
    adminSignin,
    adminLogout,
    isAdminAuthenticated,
};
