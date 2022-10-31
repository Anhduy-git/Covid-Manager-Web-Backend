const express = require('express');

const router = new express.Router();
const auth = require('../middlewares/authentication');
const necessaryPackageController = require('../controllers/necessary-package');

router.post('/', auth, necessaryPackageController.createNecessaryPackage);
router.get('/:id', necessaryPackageController.getNecessaryPackageByID);
router.get('/', necessaryPackageController.getNecessaryPackageList);
router.patch(
	'/:id',
	auth,
	necessaryPackageController.updateNecessaryPackageByID
);
router.delete(
	'/:id',
	auth,
	necessaryPackageController.deleteNecessaryPackageByID
);
router.post('/buy', auth, necessaryPackageController.buyNecessaryPackages);
router.post(
	'/:id/uploadImage',
	auth,
	necessaryPackageController.uploadNecessaryPackageImage
);

module.exports = router;
