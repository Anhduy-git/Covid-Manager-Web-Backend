const express = require('express');

const router = new express.Router();
const addressController = require('../controllers/address');
const auth = require('../middlewares/authentication');

router.get('/', auth, addressController.getAddressList);

module.exports = router;
