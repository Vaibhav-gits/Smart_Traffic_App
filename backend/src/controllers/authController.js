const User = require("../models/User");
const { Op } = require("sequelize");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, password, role, station, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Normalize email: lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);

    // Check if user exists with normalized email
    const userExists = await User.findOne({
      where: { email: normalizedEmail },
    });
    console.log("User exists:", !!userExists);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating user...");
    // Create user (password will be hashed by beforeCreate hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // Pass plain password - will be hashed by hook
      role: role || "police",
      station: station ? station.trim() : "",
      phone: phone ? phone.trim() : "",
    });
    console.log("User created:", user.id);

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        station: user.station,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors.map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: error.message || "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Normalize email for lookup
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        station: user.station,
        phone: user.phone,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ME
exports.getMe = async (req, res) => {
  res.json(req.user);
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set to resetOtp field
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send OTP via SMS if phone exists, else email
    const message = `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.`;

    try {
      if (user.phone) {
        await sendSMS(user.phone, message);
        res.json({ message: "OTP sent to your phone" });
      } else {
        await sendEmail({
          email: user.email,
          subject: "Password Reset OTP",
          message,
        });
        res.json({ message: "OTP sent to your email" });
      }
    } catch (error) {
      console.error("OTP send error:", error);
      // For development/testing, always return OTP
      res.json({
        message: "OTP generated. Use this OTP to reset your password.",
        otp: otp,
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { otp, password } = req.body;

    if (!otp || !password) {
      return res.status(400).json({ message: "OTP and password are required" });
    }

    const user = await User.findOne({
      where: {
        resetOtp: otp,
        resetOtpExpire: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Set new password
    user.password = password; // Will be hashed by pre-save hook
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
