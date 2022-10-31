const { StatusCodes } = require('http-status-codes');
const fetch = require('node-fetch');
const UserManager = require('../models/user-manager');
const { UnauthorizedError, NotFoundError } = require('../errors');
const config = require('../config');

class UserManagerController {
	// [POST] /managers
	async createUserManager(req, res, next) {
		try {
			if (req.priority === 0) {
				const user = new UserManager(req.body);
				await user.save();
				res.status(StatusCodes.CREATED).json(user);
			} else {
				next(new UnauthorizedError('You are not admin'));
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /managers/:username/block
	async blockUserManager(req, res, next) {
		try {
			console.log(req.params.username);
			if (req.priority === 0) {
				const { username } = req.params;
				await UserManager.updateOne({ username }, { isBlock: true });
				res.status(StatusCodes.OK).send();
			} else {
				next(new UnauthorizedError('You are not admin'));
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /managers/:username/unblock
	async unblockUserManager(req, res, next) {
		try {
			console.log(req.params.username);
			if (req.priority === 0) {
				const { username } = req.params;
				await UserManager.updateOne({ username }, { isBlock: false });
				res.status(StatusCodes.OK).send();
			} else {
				next(new UnauthorizedError('You are not admin'));
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /managers/admin
	// this method run in first time server start to create admin account
	async createUserAdmin(req, res, next) {
		console.log('called');
		try {
			const user = new UserManager(req.body);
			await user.save();
			// create admin user in payment system
			const { username } = req.body;
			const url = `${config.payment_manager_url}/users`;
			const options = {
				method: 'POST',
				body: JSON.stringify({ username, isAdmin: true }),
				headers: {
					'Content-Type': 'application/json'
				}
			};
			// fetch API from payment system
			await fetch(url, options);
			res.status(StatusCodes.CREATED).json(user);
		} catch (err) {
			next(err);
		}
	}

	// [GET] /managers
	async getManagerList(req, res, next) {
		try {
			if (req.priority === 0) {
				const users = await UserManager.find({ isAdmin: false });
				if (!users) {
					throw new NotFoundError('List of users managers not found');
				}
				res.status(StatusCodes.OK).json(users);
			} else {
				throw new UnauthorizedError('You are not admin');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /managers/checkHasAdmin
	async checkHasAdmin(req, res, next) {
		try {
			const admin = await UserManager.findOne({ isAdmin: true });
			if (!admin) {
				res.status(StatusCodes.OK).json({ hasAdmin: false });
				return;
			}
			res.status(StatusCodes.OK).json({ hasAdmin: true });
		} catch (err) {
			next(err);
		}
	}

	// [GET] /managers/:username/manageProcesses
	async getUserManageProcesses(req, res, next) {
		try {
			if (req.priority === 0) {
				const { username } = req.params;
				const user = await UserManager.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				const { manageProcesses } = user;
				res.status(StatusCodes.OK).json({ manageProcesses });
			} else {
				throw new UnauthorizedError('You are not admin');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /managers/:username/manageProcesses
	async addUserManageProcesses(req, res, next) {
		try {
			if (req.priority === 0) {
				const { username } = req.params;
				console.log(req.body.manageProcesses);

				const user = await UserManager.findOneAndUpdate(
					{ username },
					{ manageProcesses: req.body.manageProcesses }
				);

				if (!user) {
					throw new NotFoundError('User not found');
				}

				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not admin');
			}
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new UserManagerController();
