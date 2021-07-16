const Tour = require('../models/tour');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const ErrorHandler = require('../utils/errorHandler');

const Booking = require('../models/bookingModel');
const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  console.log(tour);

  console.log(req.user);
  //create stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          'https://admin.freetour.com/images/tours/2/free-red-budapest-tour-49.jpg',
        ],
        amount: tour.price * 100,
        quantity: 1,
        currency: 'usd',
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

const bookingCheckout = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ tour, user, price });

  console.log('orignal', req.originalUrl);
  res.redirect(`${req.protocol}://${req.get('host')}`);

  next();
});
const getBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();

  res.json({
    statu: 'success',
    records: bookings.length,
    bookings,
  });
});
module.exports = {
  getCheckoutSession,
  bookingCheckout,
  getBookings,
};
