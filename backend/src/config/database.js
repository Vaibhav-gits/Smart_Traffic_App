const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MySQL database...");
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");

    console.log("Syncing models...");
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced successfully");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    console.error("Full error details:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
