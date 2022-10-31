const { StatusCodes, BAD_REQUEST } = require('http-status-codes');
const fetch = require('node-fetch');
const sharp = require('sharp');
const User = require('../models/user');
const UserManager = require('../models/user-manager');
const TreatmentPlace = require('../models/treatment-place');
const Transaction = require('../models/transaction');
const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError
} = require('../errors');
const { dataUri } = require('../middlewares/pre-handle-image');
const { cloudinary } = require('../utils/cloudinary');
const { sendWelcomeEmail, sendCancelationEmail } = require('../utils/email');
const config = require('../config');

class UserController {
	// [POST] /users
	async createUser(req, res, next) {
		try {
			if (req.priority === 1) {
				// create new user
				const user = new User(req.body);

				// create new user in payment system
				const { username } = req.body;
				const url = `${config.payment_manager_url}/users`;
				const options = {
					method: 'POST',
					body: JSON.stringify({ username }),
					headers: {
						'Content-Type': 'application/json'
					}
				};
				// fetch API from payment system
				await fetch(url, options);
				// check valid treatment place
				const treatmentPlace = await TreatmentPlace.findOne({
					name: user.placeOfTreatment
				});
				if (treatmentPlace.currentPatients < treatmentPlace.capacity) {
					// update currentPatients of place of treatment
					treatmentPlace.currentPatients += 1;
					await treatmentPlace.save();
					// save user
					await user.save();
					res.status(StatusCodes.CREATED).json(user);
				} else {
					res.status(StatusCodes.OK).json({ treatmentPlaceIsFull: true });
				}
			} else {
				next(new UnauthorizedError('You are not manager'));
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/:username
	async getUserByUsername(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				res.status(StatusCodes.OK).json(user);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/?sortBy=-state:name
	async getUserList(req, res, next) {
		try {
			if (req.priority === 1) {
				const sort = {};
				if (req.query.sortBy) {
					const parts = req.query.sortBy.split(':');
					// handle sort field
					for (const part of parts) {
						if (part[0] === '-') {
							sort[part.substring(1)] = -1;
						} else {
							sort[part] = 1;
						}
					}
				}

				const users = await User.find().sort(sort);
				if (!users) {
					throw new NotFoundError('User not found');
				}
				res.status(StatusCodes.OK).json(users);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/:username/managedProcesses
	async getUserManagedProcesses(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				const { managedProcesses } = user;
				res.status(StatusCodes.OK).json({ managedProcesses });
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/:username/transactions
	async getUserTransactions(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				const transactions = await Transaction.find({
					user: user._id
				}).populate('necessaryPackages.necessaryPackage');
				res.status(StatusCodes.OK).json(transactions);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/me/transactions
	async getCurrentUserTransactions(req, res, next) {
		try {
			if (req.priority === 2) {
				const transactions = await Transaction.find({
					user: req.user._id
				}).populate('necessaryPackages.necessaryPackage');
				res.status(StatusCodes.OK).json(transactions);
			} else {
				throw new UnauthorizedError('You are not user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/me/managedProcesses
	async getCurrentUserManagedProcesses(req, res, next) {
		try {
			if (req.priority === 2) {
				res.status(StatusCodes.OK).json(req.user.managedProcesses);
			} else {
				throw new UnauthorizedError('You are not user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/me/debt
	async getCurrentUserDebt(req, res, next) {
		try {
			if (req.priority === 2) {
				res.status(StatusCodes.OK).json(req.user.debt);
			} else {
				throw new UnauthorizedError('You are not user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/:username/managedProcesses
	async addUserManagedProcesses(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;

				const user = await User.findOneAndUpdate(
					{ username },
					{ managedProcesses: req.body.managedProcesses }
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

	// [GET] /users/:username/relatedUsers?sort=state:name
	async getUserRelatedUsers(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				const { relatedUsers } = user;
				const relatedUsersReturn = [];

				for (const item of relatedUsers) {
					const identityCard = item.relatedUser;
					const relatedUser = await User.findOne({ identityCard });
					if (relatedUser) {
						relatedUsersReturn.push(relatedUser);
					}
				}
				// sort data
				if (req.query.sortBy) {
					const parts = req.query.sortBy.split(':');
					if (parts[0] === 'state') {
						relatedUsersReturn.sort((a, b) => a.state < b.state);
					} else {
						relatedUsersReturn.sort((a, b) => a.state > b.state);
					}
					if (parts[1] === 'name') {
						relatedUsersReturn.sort((a, b) => a.name < b.name);
					} else {
						relatedUsersReturn.sort((a, b) => a.name > b.name);
					}
				}
				res.status(StatusCodes.OK).json(relatedUsersReturn);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/:username/relatedUsers
	async createUserRelatedUsers(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				// add related users
				if (req.body) {
					user.relatedUsers.push(req.body);

					await user.save();
				}
				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /users/me
	async getCurrentUser(req, res, next) {
		try {
			if (req.priority === 2) {
				res.status(StatusCodes.OK).json(req.user);
			} else {
				throw new UnauthorizedError('You are not a user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/buyNecessaryPackages
	async buyNecessaryPackages(req, res, next) {
		try {
			if (req.priority === 2) {
				// update user debt
				const { totalPrice } = req.body;
				req.user.debt += totalPrice;
				await req.user.save();
				res.status(StatusCodes.OK).send();
				// update transaction
				const { necessaryPackages } = req.body;
				const newTransaction = new Transaction({
					user: req.user._id,
					necessaryPackages,
					totalPrice
				});
				await newTransaction.save();
				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not a user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/me/payOff
	async payOffDebt(req, res, next) {
		try {
			if (req.priority === 2) {
				console.log('yes');
				const { username } = req.user;
				// get remaining balance of current user in payment system
				const urlGetRemainingBalance = `${config.payment_manager_url}/users/${username}/remainingBalance`;
				const optionsGetRemainingBalance = {
					method: 'GET'
				};

				// fetch API from payment system
				const { remainingBalance } = await fetch(
					urlGetRemainingBalance,
					optionsGetRemainingBalance
				).then((response) => response.json());
				// Minimum amount to pay off each time
				const minimumPayment = req.user.debt * 0.05;

				let { moneyTransfer } = req.body;

				// payoff debt
				if (moneyTransfer <= remainingBalance) {
					if (moneyTransfer >= minimumPayment) {
						if (moneyTransfer >= req.user.debt) {
							moneyTransfer = req.user.debt;
							req.user.debt = 0;
						} else {
							req.user.debt -= moneyTransfer;
						}

						// //update remaining balance of current user in payment system
						const urlUpdateRemainingBalance = `${config.payment_manager_url}/users/${username}/transferToAdmin`;
						const optionsUpdateRemainingBalance = {
							method: 'PATCH',
							body: JSON.stringify({ username, moneyTransfer }),
							headers: {
								'Content-Type': 'application/json'
							}
						};
						// //fetch API from payment system
						await fetch(
							urlUpdateRemainingBalance,
							optionsUpdateRemainingBalance
						);
						await req.user.save();
						res.status(StatusCodes.OK).json({ payOffSuccess: true });
					} else {
						throw new BadRequestError(
							'The money transfer is less than minimum payment'
						);
					}
				} else {
					throw new BadRequestError('Not enough money in account');
				}
			} else {
				throw new UnauthorizedError('You are not a user');
			}
		} catch (err) {
			next(err);
		}
	}

	// [PATCH] /users/:username/update
	async updateUserByUsername(req, res, next) {
		try {
			if (req.priority === 1) {
				const updates = Object.keys(req.body);
				const allowedUpdates = ['state', 'placeOfTreatment'];
				const isValidOperation = updates.every((update) =>
					allowedUpdates.includes(update)
				);

				if (!isValidOperation) {
					throw new BadRequestError('Invalid update operation');
				}

				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				for (const update of updates) {
					if (update === 'state') {
						// update managed processed
						const activity = `Change state from ${user.state} to ${req.body.state}`;
						user.managedProcesses.push({ activity });
						user.state = req.body.state;
						// update all related users
						for (const item of user.relatedUsers) {
							const identityCard = item.relatedUser;
							const relatedUser = await User.findOne({ identityCard });
							if (relatedUser) {
								relatedUser.state = req.body.state;
								relatedUser.managedProcesses.push({ activity });
								await relatedUser.save();
							}
						}
					} else if (update === 'placeOfTreatment') {
						if (user.placeOfTreatment !== req.body.placeOfTreatment) {
							// check if user can change treatment place
							const treatmentPlace = await TreatmentPlace.findOne({
								name: req.body.placeOfTreatment
							});
							if (treatmentPlace.currentPatients < treatmentPlace.capacity) {
								// update place of treatment
								const activity = `Change place of treatment from ${user.placeOfTreatment} to ${req.body.placeOfTreatment}`;
								user.managedProcesses.push({ activity });
								user.placeOfTreatment = req.body.placeOfTreatment;
								// update currentPatients of place of treatment
								treatmentPlace.currentPatients += 1;
								await treatmentPlace.save();
							} else {
								res.status(StatusCodes.OK).json({ treatmentPlaceIsFull: true });
							}
						}
					}
				}

				await user.save();

				res.status(StatusCodes.OK).json(user);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [DELETE] /users/:username/delete
	async deleteUserByUsername(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });
				if (!user) {
					throw new NotFoundError('User not found');
				}
				// delete user
				await User.deleteOne({ username });
				// delete user in payment system
				const url = `${config.payment_manager_url}/users/${username}`;
				const options = {
					method: 'DELETE'
				};
				// fetch API from payment system
				await fetch(url, options);

				res.status(StatusCodes.NO_CONTENT).json();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/login
	async loginUser(req, res, next) {
		try {
			let token;
			const { username } = req.body;
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

	// [POST] /users/logout
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

	// [PATCH] /users/me/updatePassword
	async updateCurrentUserPassword(req, res, next) {
		try {
			const { currentPassword } = req.body;
			const { newPassword } = req.body;
			if (await User.checkCredentials(req.user, currentPassword)) {
				req.user.password = newPassword;
				// remove token
				req.user.tokens = req.user.tokens.filter(
					(token) => token.token !== req.token
				);
				await req.user.save();
				res.status(StatusCodes.OK).send();
			}
		} catch (err) {
			next(err);
		}
	}

	// [PATCH] /users/:username/updatePassword
	async updatePasswordByUsername(req, res, next) {
		try {
			const { username } = req.params;
			// user manager & admin
			const userManager = await UserManager.findOne({ username });
			if (userManager) {
				userManager.password = req.body.password;
				await userManager.save();
				res.status(StatusCodes.OK).send();
			}
			// user
			const user = await User.findOne({ username });
			if (user) {
				user.password = req.body.password;
				await user.save();
				res.status(StatusCodes.OK).send();
			}
			throw new NotFoundError('User not found');
		} catch (err) {
			next(err);
		}
	}

	// [POST] /users/:username/uploadImage
	async uploadUserImage(req, res, next) {
		try {
			if (req.priority === 1) {
				const { username } = req.params;
				const user = await User.findOne({ username });

				if (!user) {
					throw new NotFoundError('User not found');
				}
				if (!req.body.image) {
					throw new NotFoundError('Image not found');
				}

				// upload image to cloudinary
				const uploadedRes = await cloudinary.uploader.upload(req.body.image, {
					upload_preset: 'covid_manager_web'
				});
				// get url of uploaded image
				const avatar = uploadedRes.secure_url;
				user.avatar = avatar;

				await user.save();

				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new UserController();
