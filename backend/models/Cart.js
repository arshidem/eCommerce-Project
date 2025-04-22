const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  price: { 
    type: Number, 
    required: true 
  },
  productImage: { 
    type: String 
  }
});

const CartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true
  },
  items: [CartItemSchema],
  totalPrice: { 
    type: Number, 
    default: 0 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Auto-update `updatedAt` field before saving
CartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  this.totalPrice = this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  next();
});

const Cart = mongoose.model('Cart', CartSchema);
module.exports = Cart;
