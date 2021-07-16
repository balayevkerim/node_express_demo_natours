const mongoose = require('mongoose');
const validator = require('validator');
//const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Tour must have a name!'],
    },
    /*  creditCard: {
    type: String,
    validate: [validator.isCreditCard, 'Not  valid credit card number'],
  }, */
    description: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      default: 10,
    },
    difficulty: {
      type: String,
      default: 'easy',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      min: 10,
      required: [true, 'Tour must have a price!'],
    },
    summary: {
      type: String,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    ],
    slug: String,
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

/* tourSchema.pre('save', async function (req, res, next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));

  this.guides = await Promise.all(guidesPromises);
  console.log(this.guides);
  next();
}); */

tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

tourSchema.virtual('reviews', {
  ref: 'Reviews',
  foreignField: 'tour',
  localField: '_id',
});
tourSchema.pre('save', function (next) {
  console.log(this.name);
  this.slug = this.name.toLowerCase().split(' ').join('-');
  this.name = this.name.toUpperCase();
  next();
});

const Tour = mongoose.model('tour', tourSchema);

module.exports = Tour;
