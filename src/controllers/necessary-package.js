const { StatusCodes } = require('http-status-codes');
const NecessaryPackage = require('../models/necessary-package');
const {
	BadRequestError,
	UnauthorizedError,
	NotFoundError
} = require('../errors');
const Transaction = require('../models/transaction');
const { cloudinary } = require('../utils/cloudinary');

class NecessaryPackageController {
	// [POST] /necessaryPackages
	async createNecessaryPackage(req, res, next) {
		try {
			if (req.priority === 1) {
				const necessaryPackage = new NecessaryPackage(req.body);
				await necessaryPackage.save();
				res.status(StatusCodes.CREATED).send(necessaryPackage._id);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /necessaryPackages/?sortBy=-totalPrice:name
	async getNecessaryPackageList(req, res, next) {
		try {
			const sort = {};
			if (req.query.sortBy) {
				const parts = req.query.sortBy.split(':');
				// handle sort field
				parts.forEach((part) => {
					if (part[0] === '-') {
						sort[part.substring(1)] = -1;
					} else {
						sort[part] = 1;
					}
				});
			}

			const necessaryPackages = await NecessaryPackage.find().sort(sort);
			if (!necessaryPackages) {
				throw new NotFoundError('Necessary Packages not found');
			}
			res.status(StatusCodes.OK).json(necessaryPackages);
		} catch (err) {
			next(err);
		}
	}

	// [GET] /necessaryPackages/:id
	async getNecessaryPackageByID(req, res, next) {
		try {
			const { id } = req.params;
			const necessaryPackage = await NecessaryPackage.findById(id).populate(
				'necessaries.necessary'
			);
			if (!necessaryPackage) {
				throw new NotFoundError('Necessary package not found');
			}
			res.status(StatusCodes.OK).json(necessaryPackage);
		} catch (err) {
			next(err);
		}
	}

	// [PATCH] /necessaryPackages/:id
	async updateNecessaryPackageByID(req, res, next) {
		try {
			if (req.priority === 1) {
				const updates = Object.keys(req.body);
				const allowedUpdates = [
					'name',
					'necessaries',
					'totalPrice',
					'limitQuantityOfNecessary',
					'limitQuantityOfPackageOverTime',
					'limitTime'
				];
				const isValidOperation = updates.every((update) =>
					allowedUpdates.includes(update)
				);

				if (!isValidOperation) {
					throw new BadRequestError('Invalid update operation');
				}

				const { id } = req.params;
				const necessaryPackage = await NecessaryPackage.findById(id);
				if (!necessaryPackage) {
					throw new NotFoundError('Necessary package not found');
				}

				updates.forEach((update) => {
					necessaryPackage[update] = req.body[update];
				});
				await necessaryPackage.save();

				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [DELETE] /necessaryPackage/:id
	async deleteNecessaryPackageByID(req, res, next) {
		try {
			if (req.priority === 1) {
				const { id } = req.params;
				const necessaryPackage = await NecessaryPackage.findByIdAndDelete(id);
				if (!necessaryPackage) {
					throw new NotFoundError('Necessary package not found');
				}
				res.status(StatusCodes.NO_CONTENT).json();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /necessaryPackages/buy
	async buyNecessaryPackages(req, res, next) {
		try {
			// update transaction history
			const { necessaryPackages, totalPrice } = req.body;
			const userId = req.user._id;
			const transaction = new Transaction({
				user: userId,
				necessaryPackages,
				totalPrice
			});
			// update debt of user
			const savedTransaction = await transaction.save();
			req.user.debt += savedTransaction.totalPrice;
			await req.user.save();

			res.status(StatusCodes.OK).json(transaction);
		} catch (err) {
			next(err);
		}
	}

	// [POST] /necessaryPackages/:id/uploadImage
	async uploadNecessaryPackageImage(req, res, next) {
		try {
			if (req.priority === 1) {
				const { id } = req.params;
				const necessaryPackage = await NecessaryPackage.findById(id);

				if (!necessaryPackage) {
					throw new NotFoundError('Necessary package not found');
				}
				if (!req.body.image) {
					throw new NotFoundError('Image not found');
				}
				// upload image to cloudinary
				const uploadedRes = await cloudinary.uploader.upload(req.body.image, {
					upload_preset: 'covid_manager_web'
				});
				// get url of uploaded image
				const image = uploadedRes.secure_url;
				console.log(image);
				necessaryPackage.image = image;

				await necessaryPackage.save();

				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new NecessaryPackageController();
