// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,    // Database name
  process.env.DB_USER,    // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST,  // Host
    port: process.env.DB_PORT,  // Port (28117 for your case)
    dialect: process.env.DB_DIALECT,  // 'mysql'
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10),
      min: parseInt(process.env.DB_POOL_MIN, 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10),
      idle: parseInt(process.env.DB_POOL_IDLE, 10)
    },
    dialectOptions: {
      connectTimeout: 60000  // Increase timeout to 60 seconds
    }
  }
);

module.exports = sequelize;
