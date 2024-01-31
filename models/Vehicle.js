const mongoose = require("mongoose");

const vechicleSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Garage",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    brand: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    reg: {
      type: String,
      required: true,
    },
    engine: {
      type: String,
      required: false,
    },
    year: {
      type: String,
      required: false,
    },
    fuel: {
      type: String,
      required: false,
    },
    uwagi: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    authorname: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Vehicle", vechicleSchema);
