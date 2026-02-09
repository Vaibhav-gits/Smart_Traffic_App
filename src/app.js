const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   ROUTES
======================= */
const authRoutes = require("./routes/authRoutes");
const violationRoutes = require("./routes/violationRoutes");
// ...existing code...
const { allowRoles } = require("./middlewares/roleMiddleware");
// ...existing code...

app.use("/api/auth", authRoutes);
app.use("/api/violations", violationRoutes);

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

module.exports = app;
