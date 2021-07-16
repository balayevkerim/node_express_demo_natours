const express = require('express');
const router = express.Router();
const userCtrl = require('../controller/userController');
const authCtrl = require('../controller/authController');

router.patch('/updatePassword', authCtrl.protect, authCtrl.updatePassword);

router.patch(
  '/updateUser',
  authCtrl.protect,
  userCtrl.uploadUserPhoto,
  userCtrl.resizeUserPhoto,
  userCtrl.updateUserData
);
router.post('/login', authCtrl.logIn);
router.get('/logout', authCtrl.logout);

router.get(
  '/signedUpUsers',
  authCtrl.protect,
  authCtrl.restrictTo('admin', 'lead-guide'),
  authCtrl.getSignUpUsers
);
router.post('/signup', authCtrl.signUp);
router
  .route('/')
  .get(
    authCtrl.protect,
    authCtrl.restrictTo('admin', 'lead-guide'),
    userCtrl.getUsers
  )
  .post(authCtrl.protect, authCtrl.restrictTo('admin'), userCtrl.createUser);

router.delete('/deleteMe', authCtrl.protect, userCtrl.deleteMe);
router
  .route('/:id')
  .get(userCtrl.getUser)
  .delete(authCtrl.protect, authCtrl.restrictTo('admin'), userCtrl.deleteUser);
router.post('/forgotPassword', authCtrl.forgotPassword);
router.patch('/resetToken/:token', authCtrl.resetToken);

module.exports = router;
