const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

  const product = await Product.findById(productId);
if (!product) {
  return res.status(404).json({ success: false, message: "Product not found" });
}

if (product.stock < quantity) {
  return res.status(400).json({ success: false, message: "Not enough stock available" });
}

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    let itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
    res.status(200).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
  }
};




const getCart = async (req, res) => {
  try {
      const { userId } = req.params;
      let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image');

      if (!cart) {
          // Instead of 404, return an empty cart
          return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
      }

      // Filter out invalid items
      const validItems = cart.items.filter(item => item.productId !== null);

      // If invalid items were found, update the cart
      if (validItems.length !== cart.items.length) {
          cart.items = validItems;
          cart.totalPrice = validItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
          await cart.save();
      }

      res.status(200).json({ 
          success: true, 
          cart: {
              items: validItems,
              totalPrice: cart.totalPrice
          }
      });
  } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
  }
};


  


  const removeFromCart = async (req, res) => {
    try {
      const { userId, productId } = req.body;
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
  
      res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error removing from cart", error: error.message });
    }
  };
  




  const clearCart = async (req, res) => {
    try {
      const { userId } = req.params;
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      cart.items = [];
      await cart.save();
  
      res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error clearing cart", error: error.message });
    }
  };

  const increaseCartItemQuantity = async (req, res) => {
    try {
      const { userId, productId } = req.body;
  
      if (!userId || !productId) {
        return res.status(400).json({ success: false, message: "Invalid input" });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: "Item not found in cart" });
      }
  
      // Increase quantity by 1
      cart.items[itemIndex].quantity += 1;
  
      await cart.save();
  
      res.status(200).json({ success: true, message: "Item quantity increased", cart });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error increasing quantity", error: error.message });
    }
  };
  const decreaseCartItemQuantity = async (req, res) => {
    try {
      const { userId, productId } = req.body;
  
      if (!userId || !productId) {
        return res.status(400).json({ success: false, message: "Invalid input" });
      }
  
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
  
      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: "Item not found in cart" });
      }
  
      // Decrease quantity by 1 if greater than 1
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        return res.status(400).json({ success: false, message: "Cannot decrease quantity below 1" });
      }
  
      await cart.save();
  
      res.status(200).json({ success: true, message: "Item quantity decreased", cart });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error decreasing quantity", error: error.message });
    }
  };
  
  
  
  

  module.exports ={addToCart,getCart,removeFromCart,clearCart,increaseCartItemQuantity,decreaseCartItemQuantity}