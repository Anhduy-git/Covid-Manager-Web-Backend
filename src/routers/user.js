const express = require('express');

const router = new express.Router();
const auth = require('../middlewares/authentication');
const userController = require('../controllers/user');
const { multerUpload } = require('../middlewares/pre-handle-image');

router.post('/', auth, userController.createUser);
router.post(
	'/:username/relatedUsers',
	auth,
	userController.createUserRelatedUsers
);
router.get('/', auth, userController.getUserList);
router.get('/:username', auth, userController.getUserByUsername);
router.get(
	'/:username/managedProcesses',
	auth,
	userController.getUserManagedProcesses
);
router.get('/:username/transactions', auth, userController.getUserTransactions);
router.get('/:username/relatedUsers', auth, userController.getUserRelatedUsers);
router.patch('/:username', auth, userController.updateUserByUsername);
router.delete('/:username', auth, userController.deleteUserByUsername);
router.get('/me', auth, userController.getCurrentUser);
router.get('/me/transactions', auth, userController.getCurrentUserTransactions);
router.get(
	'/me/managedProcesses',
	auth,
	userController.getCurrentUserManagedProcesses
);
router.get('/me/debt', auth, userController.getCurrentUserDebt);
router.post('/me/payOff', auth, userController.payOffDebt);
router.post(
	'/buyNecessaryPackages/',
	auth,
	userController.buyNecessaryPackages
);
router.patch(
	'/me/updatePassword',
	auth,
	userController.updateCurrentUserPassword
);
router.patch(
	'/:username/updatePassword',
	userController.updatePasswordByUsername
);
router.post(
	'/:username/uploadImage',
	auth,
	multerUpload,
	userController.uploadUserImage
);

// testing
router.post(
	'/:username/addManagedProcesses',
	auth,
	userController.addUserManagedProcesses
);

module.exports = router;
