const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

console.log(process.env.NODE_ENV);
const app = require('./main');
const mongoose = require('mongoose');

const db = process.env.DATABASE.replace('<password>', process.env.DB_PWD);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('Connected to Databse');
  });

const port = process.env.PORT || 8080;
app.listen(port, (err) => {
  console.log('Server started');
  if (err) {
    console.log(err);
  }
});
