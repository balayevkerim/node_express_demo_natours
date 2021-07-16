//create and get reviews api needs to be implemented and routes as well and populate review in result
// its parent referencing
const API_Features = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

const reviewBody = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};
const getReviews = factory.getAll(Review);
const createReview = factory.createDoc(Review);
const updateReview = factory.updateDoc(Review);
const deleteReview = factory.deleteDoc(Review);
module.exports = {
  getReviews,
  createReview,
  updateReview,
  reviewBody,
  deleteReview,
};

//need to implement child routes to get tour's reviews and post review for tour/
//api/tours/:tourId/reviews post, get
//need to use the same reviewRoutes , mergeParams
// also populate to get tours' reviews and user id in get tours
//TOMORROW needs to be done.
