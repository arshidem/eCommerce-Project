const express=require('express');
const { 
    createOrder,
    validateOrder,
    saveOrderDetails,
    //  verifyPayment
     } = require('../controllers/paymentController');

const paymentRouter=express.Router();


paymentRouter.post('/order',createOrder)


paymentRouter.post('/order/validate',validateOrder)


module.exports=paymentRouter