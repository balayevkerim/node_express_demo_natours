const mongoose = require('mongoose');
const Tour = require('../../models/tour');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<password>', process.env.DB_PWD);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('Connected to Databse bro');
  });
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
  } catch (error) {
    console.log(error);
  }

  process.exit();
};

const deleteData = async (req, res) => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
};
console.log(process.argv);
if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
