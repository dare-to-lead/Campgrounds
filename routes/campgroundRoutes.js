const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const campController = require('../controllers/campController')
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware')
const multer = require('multer') //to add file information on req.body
const {storage} = require('../cloudinary')
const upload = multer({storage:storage}) //multer function
// const Campground =require('../models/campground')

router.route('/')
.get(catchAsync(campController.index))
.post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campController.createNewCamp))


 router.get('/new',isLoggedIn, campController.renderNewForm)
  
 router.route('/:id')
.get(catchAsync(campController.showCamp))
.put(isLoggedIn,isAuthor,upload.array('image'), validateCampground, catchAsync(campController.updateCamp))
.delete(isLoggedIn,isAuthor, catchAsync(campController.deleteCamp)) 
 
router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campController.renderEditForm))
  
 

  module.exports = router