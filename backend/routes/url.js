const express = require('express');
const { handleGenerateNewShortUrl, handleGetUserUrls, handleGetAnalytics, handleDeleteUrl } = require('../controllers/url');
const { restrictToLoggedInUserOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', handleGenerateNewShortUrl);
router.get('/my-links', restrictToLoggedInUserOnly, handleGetUserUrls);
router.get('/analytics/:shortId', handleGetAnalytics);
router.delete('/:id', restrictToLoggedInUserOnly, handleDeleteUrl);

module.exports = router;
