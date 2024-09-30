// models/ProfileAccess.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employer = require("./employer");
const JobPost = require("./jobPost");
const Candidate = require("./candidate");

const ProfileAccess = sequelize.define("ProfileAccess", {
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
  grantedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

ProfileAccess.belongsTo(Candidate,{
  as: "Candidate",
  foreignKey: "candidateId",
});

ProfileAccess.belongsTo(JobPost,{
  as: "JobPost",
  foreignKey: "employerId"
})

module.exports = ProfileAccess;
