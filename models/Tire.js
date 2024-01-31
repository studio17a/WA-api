const mongoose = require("mongoose");

const tireSchema = new mongoose.Schema(
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
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    name: {
      type: String,
      required: true,
    },
    storage: {
      type: String,
      required: false,
    },
    ean: {
      type: String,
      required: false,
    },
    size: {
      type: String,
    },
    washing: {
      type: String,
    },
    brand: {
      type: String,
    },
    model: {
      type: String,
    },
    height: {
      type: String,
    },
    quantity: {
      type: String,
    },
    notes: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorname: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Tire", tireSchema);
