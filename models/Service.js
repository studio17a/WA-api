const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const serviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    garage: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Garage",
    },
    items: [],
    st: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "St",
      },
    ],
    date: {
      type: String,
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
    },
    hour: {
      type: Number,
      required: true,
    },
    minute: {
      type: Number,
      required: true,
    },
    completed: {
      type: String,
      default: "approved",
    },
    from: {
      type: String,
    },
    uwagi: {
      type: String,
      default: false,
    },
    author: { type: String, required: false },
    authorname: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

serviceSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  start_seq: 500,
});

module.exports = mongoose.model("Service", serviceSchema);
