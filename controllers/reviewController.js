const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.createReview = async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.auther = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash('success', 'Created a new review')
    res.redirect(`/campground/${campground._id}`)
    }

module.exports.deleteReview = async (req,res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id,{$pull: {reviews: reviewId }})  //here pull method will pull everything that is associated with review id and make it available for us to do anything
    await Review.findByIdAndDelete(reviewId)  //and here we delete the entire review.
    req.flash('success', 'Successfully deleted a review')
    res.redirect(`/campground/${id}`)
    }