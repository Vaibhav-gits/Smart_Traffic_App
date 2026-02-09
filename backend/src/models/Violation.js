const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const Violation = sequelize.define(
  "Violation",
  {
    vehicleNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Helmet", "Seatbelt", "Other"),
      allowNull: false,
    },
    fine: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
    },
    videoUrl: {
      type: DataTypes.STRING,
    },
    officerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
Violation.belongsTo(User, { foreignKey: "officerId", as: "officer" });
User.hasMany(Violation, { foreignKey: "officerId", as: "violations" });

module.exports = Violation;
