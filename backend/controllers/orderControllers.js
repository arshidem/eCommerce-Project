const Order =require('../models/Order')



const saveOrderDetails = async (req, res) => {
    try {
      const { paymentDetails, ...orderData } = req.body;
  
      // Ensure `orderId` is correctly set
      if (!paymentDetails?.orderId) {
        return res.status(400).json({ success: false, message: "Missing orderId in payment details" });
      }
  
      const newOrder = new Order({
        ...orderData,
        orderId: paymentDetails.orderId, // Assign Razorpay Order ID
        paymentDetails,
      });
  
      await newOrder.save();
      res.status(201).json({ success: true, message: "Order saved successfully" });
    } catch (error) {
      console.error("Error saving order:", error);
      res.status(500).json({ success: false, message: "Failed to save order details", error: error.message });
    }
  };
  

  const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
  
      if (!orders.length) {
        return res.status(200).json({ success: true, orders: [], message: "No orders yet." });
      }
  
      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
  };
  

  const getOrdersByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
  
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
  
      // Fetch orders for the user, sorted by creation date
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  
      // Return an empty array instead of a 404 error
      return res.status(200).json({ success: true, orders });
  
    } catch (error) {
      console.error("Error fetching user orders:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
  };
  

  const getOneOrderById = async (req, res) => {
  const { orderId } = req.params; // Capture orderId from route parameter

  try {
    // Find the order using the provided orderId inside paymentDetails
    const order = await Order.findOne({ 'paymentDetails.orderId': orderId })
      .populate('userId', 'userName email') // Populate user info if needed
      .populate('cartItems.productId', 'name price'); // Populate product details if needed

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Return the found order as a response
    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// adminController.js

const getAdminDashboardData = async (req, res) => {
  try {
    // Total Orders: Count the total number of orders in the database
    const totalOrders = await Order.countDocuments();

    // Today's Orders: Count orders created today
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Total Earnings: Sum of totalAmount for all orders
    const totalEarnings = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Today's Earnings: Sum of totalAmount for today's orders
    const todayEarnings = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Prepare the response
    res.status(200).json({
      totalOrders,
      todayOrders,
      totalEarnings: totalEarnings[0] ? totalEarnings[0].total : 0,
      todayEarnings: todayEarnings[0] ? todayEarnings[0].total : 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; // Get orderId from URL
    const { deliveryStatus } = req.body; // Get delivery status from request body

    // Find the order by paymentDetails.orderId and update deliveryStatus
    const updatedOrder = await Order.findOneAndUpdate(
      { "paymentDetails.orderId": orderId }, // Search by orderId inside paymentDetails
      { deliveryStatus }, // Update deliveryStatus
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};








  module.exports={saveOrderDetails,getAllOrders,getOrdersByUserId,getOneOrderById,getAdminDashboardData,updateOrderStatus}