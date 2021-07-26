const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: [validator.isEmail, 'Email is required!'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  passwordCreatedAt: {
    type: Date,
    default: Date.now(),
  },
  photo: { type: String, default: 'default.jpg' },
  encryptedResetToken: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  resetTokenExpiresAt: Date,
});
userSchema.pre('save', async function (next) {
  console.log('savinggggg');
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordCreatedAt = Date.now() - 1000;
  next();
});
userSchema.methods.checkPasswordChange = function (JWT_Timestamp) {
  const issuedAt = parseInt(this.passwordCreatedAt.getTime() / 1000, 10);
  console.log(JWT_Timestamp, issuedAt);
  console.log(JWT_Timestamp < issuedAt);
  return JWT_Timestamp < issuedAt;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.encryptedResetToken = crypto
    .createHmac('sha256', process.env.RESET_TOKEN_SECRET)
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken });

  console.log(this.encryptedResetToken);
  this.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;
  console.log(this.resetTokenExpiresAt);
  return resetToken;
};

//query middlaware to fetch only those users which active flag is true

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });

  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
