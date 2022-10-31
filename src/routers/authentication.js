const express = require('express');

const router = new express.Router();
const authController = require('../controllers/authentication');
const auth = require('../middlewares/authentication');

router.post('/login', authController.loginUser);
router.post('/logout', auth, authController.logoutUser);

module.exports = router;
