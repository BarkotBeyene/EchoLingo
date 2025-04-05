const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LearningMaterial = sequelize.define("LearningMaterial", {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("text", "audio", "video"),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: "Student Upload",
  },
});

module.exports = LearningMaterial;