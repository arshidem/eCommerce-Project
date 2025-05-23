const express = require('express');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database/db'); // Import database connection
const axios = require('axios'); // Import axios for the proxy request

// Constants
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET, // Use a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 10 * 60 * 1000 } // 10 min
}));

// Database Connection
connectDB()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const userAdminAuthRouter = require('./routes/userAdminAuthRoutes');
const userRouter = require('./routes/userRoutes');
const adminRouter = require('./routes/adminRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const addressRouter = require('./routes/addressRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const offerRoute = require('./routes/offer');

// Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    "https://e-commerce-project-qmog.vercel.app",
    "https://e-commerce-project-flax.vercel.app",
    "https://ecommerce-project-frontend-4e57.onrender.com"

];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Needed to allow cookies
}));

app.use(cookieParser());

// Routes
app.use('/api/auth', userAdminAuthRouter);
app.use('/api/user', userRouter);
app.use('/api/admin-auth', userAdminAuthRouter)
app.use('/api/admin', adminRouter)
app.use('/product', productRouter)
app.use('/api/cart', cartRouter);
app.use('/api', addressRouter);
app.use('/api', paymentRouter)
app.use('/api', orderRouter)
app.use('/reviews', reviewRouter)
app.use('/api', offerRoute);

// **Add Proxy Route here**
app.post('/proxy/offer', async (req, res) => {
    try {
        const response = await axios.post('https://overbridgenet.com/jsv8/offer', req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on PORT ${PORT}`);
});
