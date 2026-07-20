const express = require('express');
const { handleUserSignup, handleUserLogin, handleGetCurrentUser, handleUserLogout } = require('../controllers/user');

const router = express.Router();

router.post('/signup', handleUserSignup);
router.post('/login', handleUserLogin);
router.get('/me', handleGetCurrentUser);
router.post('/logout', handleUserLogout);

module.exports = router;
