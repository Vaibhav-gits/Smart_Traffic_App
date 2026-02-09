const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Violation = require("../models/Violation");

// Detect violations in image
exports.detectImage = async (req, res) => {
  try {
    console.log(
      "Starting image detection - User ID:",
      req.user ? req.user.id : "No user"
    );
    console.log("Image file:", req.file ? req.file.path : "No file");

    if (!req.file) {
      console.error("No image file uploaded");
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const imagePath = req.file.path;

    // Create form data to send to ML server
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    console.log("Sending image to ML server for detection");

    // Send image to ML server for detection
    const mlResponse = await axios.post(
      "http://localhost:8000/detect/image",
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
        vehicleNumber: detectionResult.vehicleNumber || "Unknown",
        vehicleType: detectionResult.vehicle || "Unknown", // "car" or "bike"
        type: detectionResult.vehicle === "bike" ? "Helmet" : "Seatbelt",
        fine: detectionResult.fine || 500,
        imageUrl: imagePath,
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
    console.error("Error in image detection:", error);
    res
      .status(500)
      .json({ message: "Image detection failed", error: error.message });
  }
};
