require('dotenv').config();
const mongoose = require("mongoose");
mongoose.set('debug', true);
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb+srv://admin-michael:" + process.env.MONGO_PASSWORD + "@cluster0-flcwo.mongodb.net/attendanceDB",
  { useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
  console.log("Connected to DB!");
}).catch((err) => {
  console.log("ERROR: " + err.message);
});

mongoose.Promise = Promise;

module.exports.User = require("./user");
module.exports.Meeting = require("./meeting");
