const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workshop",
    required: true
  },
  name: { type: String, required: true, trim: true },
  usn: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  }
}, { timestamps: true });

// Prevent duplicate registrations by either email or USN for the same workshop
registrationSchema.index({ workshopId: 1, email: 1 }, { unique: true });
registrationSchema.index({ workshopId: 1, usn: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
