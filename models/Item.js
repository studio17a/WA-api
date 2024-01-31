const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Garage",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
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
    description: {
      type: String,
      required: false,
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
      required: false,
    },
    authorname: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Item", itemSchema);
