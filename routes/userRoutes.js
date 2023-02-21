const express = require('express')
const passport = require('passport')
const userAuthController = require('../controllers/userAuthController')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')

router.route('/register')
.get(userAuthController.renderRegisterForm)
.post(catchAsync(userAuthController.registereUser))

router.route('/login')
.get(userAuthController.renderLoginForm)
.post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login',  keepSessionInfo: true, }),userAuthController.loggedInUser)

router.get('/logout', userAuthController.logoutUser); 

module.exports = router