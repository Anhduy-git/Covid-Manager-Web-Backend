const express = require('express');

const router = new express.Router();
const userManagerController = require('../controllers/user-manager');
const auth = require('../middlewares/authentication');

router.post('/', auth, userManagerController.createUserManager);
router.post('/admin', userManagerController.createUserAdmin);
router.get('/', auth, userManagerController.getManagerList);
router.get('/checkHasAdmin', userManagerController.checkHasAdmin);
router.get('/:username/block', auth, userManagerController.blockUserManager);
router.get(
	'/:username/unblock',
	auth,
	userManagerController.unblockUserManager
);
router.get(
	'/:username/manageProcesses',
	auth,
	userManagerController.getUserManageProcesses
);

// testing
router.post(
	'/:username/manageProcesses',
	auth,
	userManagerController.addUserManageProcesses
);

module.exports = router;
