const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review')
const Store1 = require('../models/store.js');
const expressError = require('../utils/expressError');
const {reviewSchema} = require('../schemas');
const review = require('../models/review');

const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el =>el.message).join(',') 
        throw new expressError(msg,400)
    }else{
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req,res)=>{
    const store = await Store1.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id;
    store.reviews.push(review)
    await review.save()
    await store.save()
    req.flash('success','Created a new review')
    res.redirect(`/stores/${store._id}`);
}))

module.exports = router;