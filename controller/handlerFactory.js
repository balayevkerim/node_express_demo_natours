const catchAsync = require('../utils/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const API_Features = require('../utils/apiFeatures');
const createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = new Model(req.body);
    const doc = await newDoc.save();
    res.json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

const deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);
    if (!doc) {
      return next(new ErrorHandler('Document not found', 404));
    }
    res.status(200).json({
      message: 'Deleted succesfully',
    });
  });

const updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      message: 'Updated succesfully',
      data: {
        tour: updatedDoc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    //execute query
    const features = new API_Features(Model.find(filter), req.query)
      .filter()
      .sort()
      .selectField()
      .paginate();

    const doc = await features.query;
    res.status(200).json({
      message: 'Fetched succesfully',
      requestedAt: req.requestedTime,
      records: doc.length,
      data: doc,
    });
  });

module.exports = { createDoc, deleteDoc, updateDoc, getAll };
