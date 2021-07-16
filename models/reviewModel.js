//xw
const mongoose = require('mongoose');
const Tour = require('../models/tour');
const reviewModel = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Tour must have a review!'],
    minlength: 6,
  },
  rating: {
    type: Number,
    required: [true, 'Tour must have a rating!'],
    enum: [1, 2, 3, 4, 5],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
});

reviewModel.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewModel.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  console.log(this.r);
  next();
});

reviewModel.post(/^findOneAnd/, async function () {
  this.r.constructor.calcAverageTourRating(this.r.tour);
});

reviewModel.statics.calcAverageTourRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings,
    });
    console.log(stats);
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewModel.index({ tour: 1, user: 1 }, { unique: true });

reviewModel.post('save', function () {
  this.constructor.calcAverageTourRating(this.tour);
});
const Review = mongoose.model('Reviews', reviewModel);

module.exports = Review;
