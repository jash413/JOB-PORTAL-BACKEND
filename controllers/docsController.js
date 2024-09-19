// controllers/docsController.js
const expressListEndpoints = require('express-list-endpoints');
const app = require('../app');

exports.getApiEndpoints = (req, res) => {
  const endpoints = expressListEndpoints(app);
  res.json(endpoints);
};
