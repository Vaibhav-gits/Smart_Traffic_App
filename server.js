const app = require("./src/app");
const { sequelize } = require("./src/config/database");

// Register models
require("./src/models/User");
require("./src/models/Violation");

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ MySQL connected");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Tables synced");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });
