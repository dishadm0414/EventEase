require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Registration = require("./models/Registration");

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/workshops", require("./routes/workshops"));
app.use("/api/registrations", require("./routes/registrations"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "EventEase" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "An unexpected server error occurred." });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await Registration.init();
    app.listen(port, () => console.log(`EventEase API running on port ${port}`));
  })
  .catch(error => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
