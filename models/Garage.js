const mongoose = require("mongoose");
const Decimal128 = require("mongodb").Decimal128;

const garageSchema = new mongoose.Schema({
  garagename: {
    type: String,
    required: true,
  },
  lat: {
    type: Decimal128,
    required: true,
  },
  long: {
    type: Decimal128,
    required: true,
  },
});

module.exports = mongoose.model("Garage", garageSchema);
