const express = require('express');
const { handleGenerateNewShortUrl, handleGetAnalytics, handleDeleteUrl } = require('../controllers/url');

const router = express.Router();

router.post('/', handleGenerateNewShortUrl);
router.get('/analytics/:shortId', handleGetAnalytics);
router.delete('/:id', handleDeleteUrl);

module.exports = router;