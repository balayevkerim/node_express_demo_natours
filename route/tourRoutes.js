const express = require('express');
const tourController = require('../controller/tourController');
const router = express.Router();
const authCtrl = require('../controller/authController');
const reviewCtrl = require('../controller/reviewController');
const reviewRouter = require('./reviewRoutes');
//routes

router.param('id', (req, res, next, val) => {
  console.log('Id param is ' + val);

  next();
});

router.use('/:tourId/reviews', reviewRouter);
/* router
  .route('/:tourId/reviews')
  .post(authCtrl.protect, authCtrl.restrictTo('user'), reviewCtrl.createReview) */
router
  .route('/deleteAll')
  .delete(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.deleteAllTours
  );
router
  .route('/monthly-plan/:year')
  .get(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.monthlyPlanPerYear
  );
router
  .route('/tourStatus')
  .get(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.tourStatus
  );
router
  .route('/top-5-cheap')
  .get(tourController.top5Cheap, tourController.getTours);
router
  .route('/:id')
  .get(tourController.getTour)
  .delete(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourPhotos,
    tourController.resizeTourPhotos,
    tourController.updateTour
  );

router
  .route('/')
  .get(tourController.getTours)
  .post(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.toursWithinDistance);

module.exports = router;
