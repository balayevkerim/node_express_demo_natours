const express = require('express');
const bookingCtrl = require('../controller/bookingController');
const authCtrl = require('../controller/authController');

const router = express.Router();
router.get(
  `/checkout-session/:tourId`,
  authCtrl.protect,
  bookingCtrl.getCheckoutSession
);
router.get(`/bookings`, bookingCtrl.getBookings);

module.exports = router;
