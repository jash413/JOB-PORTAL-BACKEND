// models/AccessRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employer = require("./employer");
const Candidate = require("./candidate");

const AccessRequest = sequelize.define("AccessRequest", {
  employerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employer,
      key: "cmp_code",
    },
  },
  candidateId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Candidate,
      key: "can_code",
    },
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  requestedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  reviewedAt: DataTypes.DATE,
});

module.exports = AccessRequest;
