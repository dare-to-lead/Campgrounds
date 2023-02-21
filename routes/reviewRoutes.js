const express = require('express')
const router = express.Router({mergeParams:true}) //as we pass id params in the prefix route 
const reviewController = require('../controllers/reviewController')
const catchAsync = require('../utils/catchAsync')
const {validateReview,isLoggedIn,isReviewAuthor} = require('../middleware')



router.post('/',isLoggedIn, validateReview, catchAsync(reviewController.createReview))
    
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(reviewController.deleteReview))

module.exports = router