const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const ErrorHandler = require('../utils/errorHandler');
const factory = require('./handlerFactory');
const sharp = require('sharp');

const multer = require('multer');
/* var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/users');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}+${Date.now()}.${ext}`);
  },
});
 */
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
const createUser = factory.createDoc(User);

const uploadUserPhoto = upload.single('photo');

/* const getUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('name email role photo');
  res.status(200).json({
    status: 'success',
    records: users.length,
    users,
  });
}); */

const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};
const getUsers = factory.getAll(User);

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({
      status: 'fail',
      message: 'User not found',
    });
  }
  res.status(200).json({
    status: 'succcess',
    user,
  });
};
const filterBody = (reqBody, ...allowedField) => {
  const newObj = {};
  Object.keys(reqBody).forEach((element) => {
    if (allowedField.includes(element)) {
      newObj[element] = reqBody[element];
    }
  });
  return newObj;
};

//update user details email etc

//const user = req.user;
const updateUserData = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const filteredBody = filterBody(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  /* const deletedUser = await User.deleteOne({ _id: req.params.id });

  if (deletedUser.deletedCount == 0) {
    res.status(404).json({
      message: `User with id ${req.params.id}  not found`,
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'Deleted succesfully',
  }); */
  console.log('kerim', req.user);

  const deleted = await User.findByIdAndUpdate(
    { _id: req.user._id },
    { active: false }
  );

  res.status(200).json({
    status: 'success',
    message: 'Deleted succesfully',
  });
});

const deleteUser = factory.deleteDoc(User);

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUserData,
  deleteUser,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
};
