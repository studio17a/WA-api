const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  garages: [
    {
      garage: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Garage",
      },
    },
  ],
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  NIP: {
    type: String,
  },
  REGON: {
    type: String,
  },
  roles: {
    type: [String],
    default: ["Client"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  street: {
    type: String,
  },
  streetNr: {
    type: String,
  },
  postal: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
