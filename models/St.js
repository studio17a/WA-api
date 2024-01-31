const mongoose = require("mongoose");

const stSchema = new mongoose.Schema(
  {
    garage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Garage",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    predefined: {
      type: Boolean,
      default: false,
      required: true,
    },
    price: {
      type: Number,
      default: 0.0,
      required: true,
    },
    items: {
      type: Number,
      default: 1,
      required: true,
    },
    vat: {
      type: Number,
      default: 23,
      required: true,
    },
    author: { type: String, required: false },
    authorname: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("St", stSchema);
