
const express=require('express');

const {saveOrderDetails,getAllOrders,getOrdersByUserId, getOneOrderById,getAdminDashboardData,updateOrderStatus} = require('../controllers/orderControllers');

const orderRouter=express.Router();









orderRouter.post('/orders/save',saveOrderDetails)
orderRouter.get('/orders/get',getAllOrders)
orderRouter.get('/orders/:userId',getOrdersByUserId)
orderRouter.get('/order/:orderId', getOneOrderById);
orderRouter.get('/admin/dashboard', getAdminDashboardData);
orderRouter.put('/status/:orderId', updateOrderStatus);

module.exports=orderRouter