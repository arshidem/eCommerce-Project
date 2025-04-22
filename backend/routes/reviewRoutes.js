const express=require('express')
const reviewRouter=express.Router()
const {addReview,getReviews}=require('../controllers/reviewController')

reviewRouter.post('/:productId/add',addReview)
reviewRouter.get("/:productId", getReviews);

module.exports=reviewRouter