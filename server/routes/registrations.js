const express = require("express");
const mongoose = require("mongoose");
const Workshop = require("../models/Workshop");
const Registration = require("../models/Registration");

const router = express.Router();

router.post("/", async (req, res, next) => {
  let reservedWorkshopId = null;

  try {
    const { workshopId, name, usn, email } = req.body;
    if (
      !mongoose.isValidObjectId(workshopId) ||
      typeof name !== "string" || !name.trim() ||
      typeof usn !== "string" || !usn.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Provide a valid workshop, name, BMSCE USN, and email address."
      });
    }

    const normalizedUsn = usn.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate USN for this workshop
    const existingUsn = await Registration.exists({
      workshopId,
      usn: normalizedUsn
    });
    if (existingUsn) {
      return res.status(409).json({
        message: `Student with USN ${normalizedUsn} is already registered for this workshop.`
      });
    }

    // Check duplicate email for this workshop
    const existingEmail = await Registration.exists({
      workshopId,
      email: normalizedEmail
    });
    if (existingEmail) {
      return res.status(409).json({
        message: `A participant with email ${normalizedEmail} is already registered for this workshop.`
      });
    }

    // Atomically check capacity and reserve seat
    const workshop = await Workshop.findOneAndUpdate(
      {
        _id: workshopId,
        $expr: { $lt: ["$registeredCount", "$capacity"] }
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!workshop) {
      const exists = await Workshop.exists({ _id: workshopId });
      return res.status(exists ? 409 : 404).json({
        message: exists
          ? "Sorry, this workshop is full."
          : "Workshop not found."
      });
    }

    reservedWorkshopId = workshop._id;
    const registration = await Registration.create({
      workshopId: workshop._id,
      name: name.trim(),
      usn: normalizedUsn,
      email: normalizedEmail
    });
    reservedWorkshopId = null;

    res.status(201).json({ message: "Registration successful!", registration });
  } catch (error) {
    if (reservedWorkshopId) {
      await Workshop.updateOne(
        { _id: reservedWorkshopId },
        { $inc: { registeredCount: -1 } }
      ).catch(() => {});
    }

    if (error.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0];
      if (key === "usn") {
        return res.status(409).json({
          message: "Student with this BMSCE USN is already registered for this workshop."
        });
      }
      return res.status(409).json({
        message: "You are already registered for this workshop with this email."
      });
    }
    next(error);
  }
});

module.exports = router;
