const path = require('path');

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const tourRoutes = require('./route/tourRoutes');
const userRoutes = require('./route/userRoutes');
const reviewRoutes = require('./route/reviewRoutes');
const viewRoutes = require('./route/viewRoutes');
const bookingRoute = require('./route/bookingRoute');

const ErrorHandler = require('./utils/errorHandler');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const mongoSanitize = require('express-mongo-sanitize');
const { urlencoded } = require('express');
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again after ',
});

//serve static files
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', limit);
//middlewarres
/* if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} */
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  console.log('test cok', req.cookies);
  next();
});

app.use(xss());
app.use(mongoSanitize());

//routes

app.use('/', viewRoutes);
app.use('/api/booking', bookingRoute);
app.use('/api/tours', tourRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.all('*', (req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl}  not found`, 404));
});

//error handler middleware
app.use((err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
});
module.exports = app;
