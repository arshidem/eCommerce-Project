const express = require('express');
const multer = require('multer');
const path = require('path');
const { addProduct,updateProduct, getProducts,getProductById,removeProduct, adminProducts,decreaseProductStock } = require('../controllers/productController');

const productRouter = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify folder to store images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    files: 3, // Limit to 3 files
  },
});

// Routes
productRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));


productRouter.put('/update-product/:productId', upload.array('images', 3), updateProduct);
productRouter.post('/add-product', upload.array('images', 3), addProduct); // Route for adding a product
productRouter.get('/products', getProducts); // Route for fetching all products
productRouter.get('/products/:id', getProductById); // Route to fetch product by ID
productRouter.delete('/delete-product/:productId', removeProduct);
productRouter.get('/admin/products', adminProducts);
productRouter.post('/decrease-stock', decreaseProductStock);




module.exports = productRouter;
