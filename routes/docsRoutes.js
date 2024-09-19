// routes/docsRoutes.js
const express = require('express');
const { getApiEndpoints } = require('../controllers/docsController');
const router = express.Router();

router.get('/docs', getApiEndpoints); // GET /api/docs - show all endpoints

module.exports = router;
