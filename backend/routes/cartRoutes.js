const express = require('express');
const { addToCart, getCart, removeFromCart, clearCart,increaseCartItemQuantity,decreaseCartItemQuantity } = require('../controllers/cartControllers');

const cartRouter = express.Router();

cartRouter.post('/add', addToCart);
cartRouter.get('/:userId', getCart);
cartRouter.post('/remove', removeFromCart);
cartRouter.delete('/clear/:userId', clearCart);
cartRouter.post('/increase', increaseCartItemQuantity);
cartRouter.post('/decrease', decreaseCartItemQuantity);
module.exports = cartRouter;
