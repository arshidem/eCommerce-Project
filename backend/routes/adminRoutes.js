const express=require('express')
const adminAuth=require('../middleware/adminAuth')
const getAdminData = require('../controllers/adminController')
const adminRouter=express.Router()

adminRouter.get('/admin-data',adminAuth,getAdminData)

module.exports=adminRouter