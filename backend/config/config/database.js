const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables

// Create a Sequelize instance using DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for cloud-hosted databases
    },
  },
});

// Test connection
sequelize.authenticate()
  .then(() => console.log("PostgreSQL Database Connected Successfully"))
  .catch((error) => console.error("Database Connection Failed:", error));

module.exports = sequelize;
