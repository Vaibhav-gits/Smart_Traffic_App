const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createViolation,
  getViolations,
  getOfficerViolations,
} = require("../controllers/violationController");
const upload = require("../middlewares/uploadMiddleware");

const { allowRoles } = require("../middlewares/roleMiddleware");
const { detectVideo } = require("../controllers/videoDetectionController");
const { detectImage } = require("../controllers/imageDetectionController");

// Create a violation (image/video optional)
router.post("/", protect, upload.single("file"), createViolation);

// Police + Admin
router.post("/", protect, allowRoles("police", "admin"), createViolation);

// Get officer's own violations
router.get("/my", protect, allowRoles("police", "admin"), getOfficerViolations);

// Admin only
router.get("/", protect, allowRoles("admin"), getViolations);

// Detect video for violations
router.post("/detect/video", protect, upload.single("video"), detectVideo);

// Detect image for violations
router.post("/detect/image", protect, upload.single("image"), detectImage);

module.exports = router;
