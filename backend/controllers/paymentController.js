const Razorpay = require("razorpay");
const crypto = require('crypto');
const Order =require('../models/Order')

const createOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_ID_KEY,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    // Create an order
    const options = {
      amount: req.body.amount, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Order Created:", order);

    if (!order || !order.id) {
      return res.status(500).json({ success: false, message: "Order creation failed, no order ID returned" });
    }

    // Send order details back to frontend
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
  }
};

const validateOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature,userData } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing required parameters for validation' });
  }

  // Create the signature to verify
  const checkSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY);
  checkSignature.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = checkSignature.digest('hex');

  console.log("Generated Digest:", digest);
  console.log("Razorpay Signature:", razorpay_signature);

  // Validate the signature
  if (digest !== razorpay_signature) {
    return res.status(400).json({ message: 'Transaction is not legit!' });
  }

  // If signature is valid, return success
  res.json({
    success: true,
    message: 'Payment success',
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    userData:userData

  });
//   console.log(userData);

 
 
};




  





module.exports = {
  createOrder,
  validateOrder,
};
