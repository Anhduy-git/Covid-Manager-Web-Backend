const { StatusCodes } = require('http-status-codes');
const { UnauthorizedError, NotFoundError } = require('../errors');
const User = require('../models/user');
const UserManager = require('../models/user-manager');
const { sendWelcomeEmail } = require('../utils/email');

class AuthController {
	// [POST] /auth/login
	async loginUser(req, res, next) {
		try {
			console.log('yes');
			let token;
			const { username } = req.body;
			console.log(username);
			// manager user
			const userManager = await UserManager.findOne({ username });
			if (userManager) {
				if (userManager.password === '') {
					res.status(StatusCodes.OK).json({ userManager, hasPassword: false });
				} else {
					const isValidUser = await UserManager.checkCredentials(
						userManager,
						req.body.password
					);
					if (isValidUser) {
						// check if user manager is blocked by admin
						if (!userManager.isBlock) {
							token = await userManager.generateAuthToken();
							res
								.status(StatusCodes.OK)
								.json({ userManager, token, hasPassword: true });
						} else {
							throw new UnauthorizedError('Your account has been blocked');
						}
					} else {
						throw new UnauthorizedError('Authentication failed');
					}
				}
				return;
			}

			// normal user
			const user = await User.findOne({ username });
			if (user) {
				if (user.password === '') {
					// return create password page
					if (user.email && user.email !== '') {
						sendWelcomeEmail(user.email, user.name);
					}
					res.status(StatusCodes.OK).send({ user, hasPassword: false });
				} else {
					const isValidUser = await User.checkCredentials(
						user,
						req.body.password
					);
					if (isValidUser) {
						token = await user.generateAuthToken();
						res.status(StatusCodes.OK).json({ user, token, hasPassword: true });
					} else {
						throw new UnauthorizedError('Authentication failed');
					}
				}
				return;
			}

			// user not exist
			throw new UnauthorizedError('Username not exist');
		} catch (err) {
			next(err);
		}
	}

	// [POST] /auth/logout
	async logoutUser(req, res, next) {
		try {
			req.user.tokens = req.user.tokens.filter(
				(token) => token.token !== req.token
			);
			await req.user.save();
			res.status(StatusCodes.OK).send();
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new AuthController();
