const express = require('express');

const router = new express.Router();
const auth = require('../middlewares/authentication');
const necessaryController = require('../controllers/necessary');
// const {multerUpload} = require('../../middlewares/pre-handle-image');

router.post('/', auth, necessaryController.createNecessary);
router.get('/:id', auth, necessaryController.getNecessaryByID);
router.get('/', auth, necessaryController.getNecessaryList);
router.patch('/:id', auth, necessaryController.updateNecessary);
router.delete('/:id', auth, necessaryController.deleteNecessaryByID);
router.post('/:id/uploadImage', auth, necessaryController.uploadNecessaryImage);

module.exports = router;
