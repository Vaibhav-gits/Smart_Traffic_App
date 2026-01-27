const Violation = require("../models/Violation");

// Create a new violation
exports.createViolation = async (req, res) => {
  try {
    console.log("Creating violation - Request body:", req.body);
    console.log("User ID:", req.user ? req.user.id : "No user");
    console.log("File:", req.file ? req.file.path : "No file");

    const { vehicleNumber, vehicleType, type, fine } = req.body;
    const officerId = req.user.id;
    let imageUrl = null;
    let videoUrl = null;

    if (req.file) {
      if (req.file.mimetype.startsWith("image")) {
        imageUrl = req.file.path;
      } else if (req.file.mimetype.startsWith("video")) {
        videoUrl = req.file.path;
      }
    }

    if (!vehicleNumber || !vehicleType || !type || !fine) {
      console.error("Missing required fields:", {
        vehicleNumber,
        vehicleType,
        type,
        fine,
      });
      return res.status(400).json({
        message:
          "Missing required fields: vehicleNumber, vehicleType, type, fine",
      });
    }

    const violation = await Violation.create({
      officerId,
      vehicleNumber,
      vehicleType,
      type,
      fine,
      imageUrl,
      videoUrl,
    });

    console.log("Violation created successfully:", violation.id);
    res.status(201).json(violation);
  } catch (error) {
    console.error("Error creating violation:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all violations
exports.getViolations = async (req, res) => {
  try {
    const violations = await Violation.findAll({
      include: [
        {
          model: require("../models/User"),
          as: "officer",
          attributes: ["name", "email", "station"],
        },
      ],
    });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get violations by officer
exports.getOfficerViolations = async (req, res) => {
  try {
    const violations = await Violation.findAll({
      where: { officerId: req.user.id },
    });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
