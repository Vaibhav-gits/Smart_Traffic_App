const express = require("express");
const router = express.Router();

// ✅ CORRECT PATH
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");

const { allowRoles } = require("../middlewares/roleMiddleware");

router.post("/register", registerUser);

// Login (public)
router.post("/login", loginUser);

// Get profile
router.get("/me", protect, getMe);

// Forgot password (public)
router.post("/forgot-password", forgotPassword);

// Reset password (public)
router.post("/reset-password", resetPassword);

module.exports = router;
