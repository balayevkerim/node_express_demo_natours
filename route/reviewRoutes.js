const express = require('express');
const reviewCtrl = require('../controller/reviewController');
const authCtrl = require('../controller/authController');

const router = express.Router({ mergeParams: true });
router
  .route('/')
  .get(reviewCtrl.getReviews)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('user'),
    reviewCtrl.reviewBody,
    reviewCtrl.createReview
  );
router
  .route('/:id')
  .post(authCtrl.protect, reviewCtrl.updateReview)
  .delete(authCtrl.protect, reviewCtrl.deleteReview);

module.exports = router;
