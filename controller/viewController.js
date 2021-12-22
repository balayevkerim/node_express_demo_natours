const Tour = require('../models/tour');
const User = require('../models/userModel');

const tourCtrl = require('./tourController');
const catchAsync = require('../utils/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const loadOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'Exciting tours for adventurous people',
  });

});

const loadTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(
      new ErrorHandler(`There is no such tour ${req.params.slug}`, 400)
    );
  }
  console.log('Karim', tour);
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

const getAccountPage = async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My Account',
  });
};
const login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log in',
  });
});

//updating by form data
const updateUserData = catchAsync(async (req, res, next) => {
  console.log(req.body);
  console.log(req.user);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      runValidators: true,
      new: true,
    }
  );
  res.status(200).render('account', {
    status: 'success',
    user: updatedUser,
  });
});

module.exports = {
  loadOverview,
  loadTourPage,
  login,
  getAccountPage,
  updateUserData,
};
