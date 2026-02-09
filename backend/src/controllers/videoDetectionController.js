const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Violation = require("../models/Violation");

// Detect violations in video
exports.detectVideo = async (req, res) => {
  try {
    console.log(
      "Starting video detection - User ID:",
      req.user ? req.user.id : "No user"
    );
    console.log("Video file:", req.file ? req.file.path : "No file");

    if (!req.file) {
      console.error("No video file uploaded");
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const videoPath = req.file.path;

    // Create form data to send to ML server
    const formData = new FormData();
    formData.append("video", fs.createReadStream(videoPath));

    console.log("Sending video to ML server for detection");

    // Send video to ML server for detection
    const mlResponse = await axios.post(
      "http://localhost:8000/detect/video",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    const detectionResult = mlResponse.data;
    console.log("ML server response:", detectionResult);

    // If violation detected, create a violation record
    if (detectionResult.violation) {
      console.log("Violation detected, creating record");

      const violation = await Violation.create({
        officerId: req.user.id,
        vehicleNumber: req.body.vehicleNumber || "Unknown", // Assuming vehicleNumber might be passed
        type: detectionResult.vehicle === "bike" ? "Helmet" : "Seatbelt",
        fine: 500, // Example fine amount
        videoUrl: videoPath,
        // Add other fields as needed
      });

      console.log("Violation record created successfully:", violation.id);

      return res.status(201).json({
        message: "Violation detected and recorded",
        violation,
        detection: detectionResult,
      });
    } else {
      console.log("No violation detected");
      return res.json({
        message: "No violation detected",
        detection: detectionResult,
      });
    }
  } catch (error) {
    console.error("Error in video detection:", error);
    res
      .status(500)
      .json({ message: "Video detection failed", error: error.message });
  }
};
