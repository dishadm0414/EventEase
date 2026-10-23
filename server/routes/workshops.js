const express = require("express");
const mongoose = require("mongoose");
const Workshop = require("../models/Workshop");
const Registration = require("../models/Registration");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { title, description, date, venue, capacity } = req.body;
    if (
      typeof title !== "string" || !title.trim() ||
      typeof description !== "string" || !description.trim() ||
      typeof venue !== "string" || !venue.trim() ||
      !Number.isInteger(capacity) || capacity < 1 ||
      !date || Number.isNaN(Date.parse(date))
    ) {
      return res.status(400).json({
        message: "Provide valid workshop details and capacity."
      });
    }

    const workshop = await Workshop.create({
      title: title.trim(),
      description: description.trim(),
      date,
      venue: venue.trim(),
      capacity
    });
    res.status(201).json(workshop);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const workshops = await Workshop.find().sort({ date: 1 });
    res.json(workshops);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/attendees", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid workshop ID." });
    }

    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found." });
    }

    const attendees = await Registration.find({ workshopId: workshop._id })
      .select("name usn email createdAt")
      .sort({ createdAt: 1 });

    res.json({ workshop, attendees });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
