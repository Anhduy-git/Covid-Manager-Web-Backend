const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserManager = require('../models/user-manager');
const { BadRequestError, UnauthorizedError } = require('../errors');
const config = require('../config');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = jwt.verify(token, config.jwt_secret);
		// check if user exist and token is included in tokens array
		const user = await User.findOne({
			_id: decoded._id,
			'tokens.token': token
		});
		// check if manager user exist and token is included in tokens array
		const userManager = await UserManager.findOne({
			_id: decoded._id,
			'tokens.token': token
		});

		if (!user && !userManager) {
			throw new UnauthorizedError('Authentication failed');
		} else if (user) {
			req.user = user;
			req.priority = 2;
		} else {
			req.user = userManager;
			// is Admin
			if (userManager.isAdmin) {
				req.priority = 0;
			}
			// is Manager
			else {
				req.priority = 1;
			}
		}
		req.token = token;
		next();
	} catch (err) {
		next(err);
	}
};
module.exports = auth;
