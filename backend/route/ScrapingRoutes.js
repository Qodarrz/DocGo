const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/ScrapingYoutubeController');
const { authenticate } = require("../middleware/auth");   

router.get('/yt', authenticate, scrapeController.getPersonalizedEducation);

module.exports = router;