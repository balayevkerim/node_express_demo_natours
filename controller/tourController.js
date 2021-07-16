const Tour = require('../models/tour');
const API_Features = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const ErrorHandler = require('../utils/errorHandler');

const factory = require('./handlerFactory');
const sharp = require('sharp');

const multer = require('multer');

let storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  console.log(file);
  console.log(req.body);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else
    cb(
      new ErrorHandler('Only image allowed, please add correct format', 400),
      false
    );
};
const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

const uploadTourPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

const resizeTourPhotos = catchAsync(async (req, res, next) => {
  console.log('files', req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  //imagecover
  const imageCoverName = `tour-${req.params.id}.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1000)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverName}`);

  //images array
  req.body.images = [];
  const images = req.files.images.map(async (image, i) => {
    const imageName = `tour-${req.params.id}-${i + 1}.jpeg`;
    await sharp(image.buffer)
      .resize(2000, 1000)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageName}`);
    req.body.images.push(imageName);
  });
  await Promise.all(images);
  console.log('images', images);
  //req.body.images = images;
  req.body.imageCover = imageCoverName;
  next();
});

const top5Cheap = (req, res, next) => {
  req.query.limit = 5;
  req.query.fields = 'name price difficulty description';
  req.query.sort = 'price';
  console.log('Cheap 5 tours');
  next();
};

const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  console.log(req.params.id);
  if (!tour) {
    res.status(404).json({ status: 'Fail', message: 'Tour not found' });
  }
  res
    .status(200)
    .json({ status: 'Success', message: 'Fetched succesfully', tour: tour });
});

const getToursTest = catchAsync(async (req, res, next) => {
  //filtering
  /*  const queryObj = { ...req.query }; {price:300}
    const excludeItems = ['sort', 'limit', 'page', 'fields'];
    excludeItems.forEach((element) => {
      delete queryObj[element];
    }); 
    let queryString = JSON.stringify(queryObj);
    queryString = JSON.parse(
      queryString.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    ); */

  //let query =  Tour.find(queryString);

  //sorting
  /* if (req.query.sort) {
      const sortingCriteria = req.query.sort.split(',').join(' ');
      query = query.sort(sortingCriteria);
      console.log(sortingCriteria);
    } else {
      query = query.sort('difficulty');
    } */

  //limiting fields
  /* 
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    } */

  //pagination//

  /* const page = req.query.page || 1;
    const limit = +req.query.limit || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit); */

  /*  if (req.query.page) {
      const numOfDocs = await Tour.countDocuments();
      if (skip >= numOfDocs) throw new Error('SIzeafsa');
    } */

  //execute query
  const features = new API_Features(Tour.find(), req.query)
    .filter()
    .sort()
    .selectField()
    .paginate();

  const tours = await features.query;
  res.status(200).json({
    message: 'Fetched succesfully',
    requestedAt: req.requestedTime,
    records: tours.length,
    data: {
      tours: tours,
    },
  });
});

const getTours = factory.getAll(Tour);
const updateTour = factory.updateDoc(Tour);
const deleteTour = factory.deleteDoc(Tour);
const createTour = factory.createDoc(Tour);

const deleteAllTours = catchAsync(async (req, res, next) => {
  const deletedDocs = await Tour.deleteMany();
  console.log(deletedDocs);

  res.status(200).json({
    status: 'success',
    data: deletedDocs,
  });
});

const tourStatus = catchAsync(async (req, res) => {
  const tourStat = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        total: { $sum: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tourStat,
    },
  });
});

const monthlyPlanPerYear = catchAsync(async (req, res) => {
  const year = +req.params.year;
  console.log(year);
  const monthlyStat = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: { $sum: 1 },
        tours: { $push: { name: '$name' } },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      monthlyStat,
    },
  });
});

const toursWithinDistance = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit == 'mi' ? distance / 3963.2 : distance / 6378.1;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new ErrorHandler(
        'Please specifiy longtitude and latitude in correct format',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  console.log(distance, latlng, unit);
  console.log(lat, 'lat', 'longti', lng);
  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
};

module.exports = {
  createTour,
  getTours,
  getTour,
  deleteTour,
  updateTour,
  top5Cheap,
  tourStatus,
  monthlyPlanPerYear,
  deleteAllTours,
  toursWithinDistance,
  resizeTourPhotos,
  uploadTourPhotos,
};
