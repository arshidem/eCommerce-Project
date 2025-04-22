const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true }, // Ensure orderId is required
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    firstName: String,
    lastName: String,
    houseNo: String,
    city: String,
    state: String,
    pin: String,
    phone: String,
  },
  cartItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  deliveryStatus:String,
  totalAmount: { type: Number, required: true },
  paymentDetails: {
    orderId: String, // Razorpay order ID
    paymentId: String,
    signature: String,
    status: { type: String, default: "Pending" },
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
