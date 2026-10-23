const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true, trim: true },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    validate: Number.isInteger
  },
  registeredCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Workshop", workshopSchema);
