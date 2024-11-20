const express = require("express");
const jobCateRoutes = require("./routes/jobCateRoutes");
const employerRoutes = require("./routes/employerRoutes");
const candidateExpRoutes = require("./routes/candidateExpRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const candidateEduRoutes = require("./routes/candidateEduRoutes");
const jobPostRoutes = require("./routes/jobPostRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const cors = require("cors");
const fs = require("fs");

const app = express();

// CORS middleware
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Swagger configuration options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal API",
      version: "1.0.0",
      description: "API for a job portal application",
    },
    servers: [
      {
        url: "http://localhost:3000", // Base URL for all endpoints
        description: "Local server",
      },
      {
        url: "https://job-portal-backend-production.up.railway.app", // Base URL for all endpoints
        description: "Development server",
      },
      {
        url: "https://saisunsolutions.com/initadmin/ifasjob", // Base URL for all endpoints
        description: "Production server",
      },
    ],
  },
  apis: [
    "./controllers/authController.js",
    "./controllers/jobCateController.js",
    "./controllers/employerController.js",
    "./controllers/candidateController.js",
    "./controllers/candidateExpController.js",
    "./controllers/candidateEduController.js",
    "./controllers/jobPostController.js",
    "./controllers/adminController.js",
    "./controllers/jobApplicationController.js",
  ],
};

// Initialize swagger-jsdoc to generate Swagger documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// fs.writeFileSync('./swagger.json', JSON.stringify(swaggerDocs, null, 2));

// Default route
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome to the Job Portal API</h1>
    <p>Click <a href="/api-docs">here</a> to view the API documentation</p>
  `);
});

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use the login routes
app.use("/api/v1/auth", authRoutes);

// Use the jobCate routes
app.use("/api/v1/job-categories", jobCateRoutes);

// Use the employer routes
app.use("/api/v1/employers", employerRoutes);

// Use the candidate routes
app.use("/api/v1/candidates", candidateRoutes);

// Use the candidate experience routes
app.use("/api/v1/experience", candidateExpRoutes);

// Use the candidate education routes
app.use("/api/v1/education", candidateEduRoutes);

// Use the job post routes
app.use("/api/v1/job-posts", jobPostRoutes);

// Use the admin routes
app.use("/api/v1/admin", adminRoutes);

// Use the job application routes
app.use("/api/v1/job-applications", jobApplicationRoutes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
