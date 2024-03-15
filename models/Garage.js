const mongoose = require("mongoose");
const Decimal128 = require("mongodb").Decimal128;

const garageSchema = new mongoose.Schema({
  garagename: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: false,
  },
  stuff: {
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
  },
  nr: {
    type: String,
    required: false,
  },
  postal: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  phones: [
    {
      type: String,
      required: false,
    },
  ],
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
