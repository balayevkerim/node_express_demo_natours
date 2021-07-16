const express = require('express');
const router = express.Router();
const viewCtrl = require('../controller/viewController');
const authCtrl = require('../controller/authController');
const bookingCtrl = require('../controller/bookingController');

router.use('/', authCtrl.isLoggedIn);
router.get('/', bookingCtrl.bookingCheckout, viewCtrl.loadOverview);

router.get('/tours/:slug', viewCtrl.loadTourPage);
router.get('/login', viewCtrl.login);
//router.post('/submit-user-data', authCtrl.protect, viewCtrl.updateUserData);

router.get('/me', authCtrl.protect, viewCtrl.getAccountPage);

module.exports = router;
