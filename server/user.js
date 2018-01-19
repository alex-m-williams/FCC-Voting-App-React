var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// create User Schema
var User = new Schema({
  name: String,
  someID: String,
  wholeprof: Object
});

module.exports = mongoose.model("users", User);
