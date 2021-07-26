const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
const ErrorHandler = require('../utils/errorHandler');
const { promisify } = require('util');
const Email = require('../utils/email');
const crypto = require('crypto');

const signJWT = (id) => {
  const token = jwt.sign({ id: id }, 'secret', { expiresIn: '1h' });
  console.log({ token });

  return token;
};
const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(user, url).sendWelcome();
  const token = signJWT(user._id);
  res.status(201).json({
    status: 'success',
    token,
    data: user,
    createdAt: user.passwordCreatedAt,
  });
});

const getSignUpUsers = async (req, res, next) => {
  try {
    const signedUpUsers = await User.find();

    res.status(200).json({
      status: 'success',
      data: signedUpUsers,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong' + error,
    });
  }
};

const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(email);
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 400));
    }
    // const userPwd = await bcrypt.compare(password, user.password);

    if (!userPwd) {
      return next(new ErrorHandler('Invalid email or password,ups', 400));
    }

    //generate token

    const token = signJWT(user._id);
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 60 * 1000 * 1000),
      //secure: true,
      httpOnly: true,
    });

    console.log('cookie', res.cookie.jwt);
    const time = new Date();
    res.status(200).json({
      status: 'success',
      token,
      createdAt: time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong' + error,
    });
  }
};

const logout = async (req, res, next) => {
  res.cookie('jwt', 'LOGGEDOUT', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged Out Successfully',
  });
};
const isLoggedIn = async (req, res, next) => {
  console.log('test');
  try {
    //check if token is there
    if (req.cookies.jwt) {
      //verify if token is valid
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, 'secret');

      //find user with that token

      const user = await User.findById({ _id: decoded.id });
      if (!user) {
        return next();
      }

      //check if password changed after token generated
      if (user.checkPasswordChange(decoded.iat)) {
        return next();
      }
      res.locals.user = user;
      return next();
    }

    next();
  } catch (error) {
    return next();
  }
};

const protect = async (req, res, next) => {
  try {
    let token;
    //check if token is there
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(new ErrorHandler('No token found', 401));
    }

    //verify if token is valid
    const decoded = await promisify(jwt.verify)(token, 'secret');

    //find user with that token

    const user = await User.findById({ _id: decoded.id });
    if (!user) {
      return next(new ErrorHandler('User not found for the token'), 401);
    }

    //check if password changed after token generated
    if (user.checkPasswordChange(decoded.iat)) {
      return next(
        new ErrorHandler('Password has been changed , please re log in!', 401)
      );
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token',
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          'You are not authorized to perform this operation',
          403
        )
      );
    }
    next();
  };
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler('No user found with this email', 404));
    }

    const resetToken = user.createResetToken();
    console.log(user);
    await user.save({ validateBeforeSave: false });
    //send token by email to update password
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/users/resetToken/${resetToken}`;

    /* await sendEmail({
      email: user.email,
      message,
      subject: 'Reset your token',
    }); */

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token has been sent to email',
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong , ' + error,
    });
  }
};

const resetToken = async (req, res, next) => {
  try {
    const token = req.params.token;
    const encryptedResetToken = crypto
      .createHmac('sha256', process.env.RESET_TOKEN_SECRET)
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      encryptedResetToken,
      resetTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          'Token expred to change the password. please request new one.',
          403
        )
      );
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    user.encryptedResetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    await user.save();
    const newToken = await jwt.sign({ id: user._id }, 'secret', {
      expiresIn: '1d',
    });

    res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong , ' + error,
    });
  }
};

const updatePassword = catchAsync(async (req, res, next) => {
  //1 get user from collection
  console.log(req.user);
  const user = await User.findById(req.user._id);

  //2 check if posted curretn pwd is correct
  // const userPwd = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!userPwd) {
    return next(new ErrorHandler('Current password is not correct', 400));
  }
  //3 if so update pwd

  user.password = req.body.password;

  user.confirmPassword = req.body.confirmPassword;

  await user.save();

  //4 log in user , create token

  const token = signJWT(user._id);
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 60 * 1000 * 1000),
    //secure: true,
    httpOnly: true,
  });

  res.status(200).json({
    status: 'succes',
    message: 'Password updated succesfully',
    token,
  });
});

module.exports = {
  signUp,
  getSignUpUsers,
  logIn,
  protect,
  restrictTo,
  forgotPassword,
  resetToken,
  updatePassword,
  isLoggedIn,
  logout,
};
