const { DataTypes } = require("sequelize");
const JobCate = require("./jobCate");
const Employer = require("./employer");
const sequelize = require("../config/db"); // Assuming you have a sequelize instance

const JobPost = sequelize.define(
  "JobPost",
  {
    job_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    job_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    job_cate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    required_skills: {
      type: DataTypes.TEXT,
      allowNull: true, // Comma-separated skills or array (if preferred)
    },
    cmp_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // Foreign key linking to the employer (Company)
    },
    posted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status:{
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  },
  {
    timestamps: true,
    tableName: "job_posts",
  }
);

JobPost.belongsTo(JobCate, {
  foreignKey: "job_cate",
  targetKey: "cate_code",
  as: "job_category",
});

JobPost.belongsTo(Employer, {
  foreignKey: "cmp_id",
  targetKey: "cmp_code",
  as: "employer",
});

module.exports = JobPost;
