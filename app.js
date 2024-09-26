const express = require('express');
const jobCateRoutes = require('./routes/jobCateRoutes');
const employerRoutes = require('./routes/employerRoutes');
const candidateExpRoutes = require("./routes/candidateExpRoutes");
const candidateRoutes = require('./routes/candidateRoutes');
const candidateEduRoutes = require("./routes/candidateEduRoutes");
const loginRoutes = require("./routes/loginRoutes");
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Swagger configuration options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal API',
      version: '1.0.0',
      description: 'API for managing job categories, employers, and candidates.',
    },
    servers: [
      {
        url: 'http://localhost:3000',  // Base URL for all endpoints
        description: 'Local server',
      },
    ],
  },
  apis: [
    './controllers/jobCateController.js',
    './controllers/employerController.js',
    './controllers/candidateController.js',
    './controllers/candidateExpController.js',
    './controllers/candidateEduController.js',
    './controllers/loginController.js',
  ],
};

// Initialize swagger-jsdoc to generate Swagger documentation
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Job Portal API');
});

// Use the login routes
app.use('/api/v1/auth', loginRoutes);

// Use the jobCate routes
app.use('/api/v1/job-categories', jobCateRoutes);

// Use the employer routes
app.use('/api/v1/employers', employerRoutes);

// Use the candidate routes
app.use('/api/v1/candidates', candidateRoutes);

// Use the candidate experience routes
app.use('/api/v1/experience', candidateExpRoutes);

// Use the candidate education routes
app.use('/api/v1/education', candidateEduRoutes);

// Error handler middleware
app.use(errorHandler);

module.exports = app;
