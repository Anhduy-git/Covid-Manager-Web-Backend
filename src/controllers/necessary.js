const { StatusCodes } = require('http-status-codes');
const Necessary = require('../models/necessary');
const {
	BadRequestError,
	UnauthorizedError,
	NotFoundError
} = require('../errors');
const { cloudinary } = require('../utils/cloudinary');

class NecessaryController {
	// [POST] /necessaries
	async createNecessary(req, res, next) {
		try {
			if (req.priority === 1) {
				const necessary = new Necessary(req.body);
				await necessary.save();
				res.status(StatusCodes.CREATED).send(necessary._id);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /necessaries/?sortBy=-price:name
	async getNecessaryList(req, res, next) {
		try {
			if (req.priority === 1) {
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
				const necessaries = await Necessary.find().sort(sort);
				if (!necessaries) {
					throw new NotFoundError('Necessary Packages not found');
				}
				res.status(StatusCodes.OK).json(necessaries);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /necessaries/:id
	async getNecessaryByID(req, res, next) {
		try {
			if (req.priority === 1) {
				const { id } = req.params;
				const necessary = await Necessary.findById(id);
				if (!necessary) {
					throw new NotFoundError('Necessary not found');
				}
				res.status(StatusCodes.OK).json(necessary);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [PATCH] /necessaries/:id
	async updateNecessary(req, res, next) {
		try {
			if (req.priority === 1) {
				const updates = Object.keys(req.body);
				const allowedUpdates = ['name', 'price', 'unit'];
				const isValidOperation = updates.every((update) =>
					allowedUpdates.includes(update)
				);

				if (!isValidOperation) {
					throw new BadRequestError('Invalid update operation');
				}

				const { id } = req.params;
				const necessary = await Necessary.findById(id);
				if (!necessary) {
					throw new NotFoundError('Necessary not found');
				}
				// update data
				updates.forEach((update) => {
					necessary[update] = req.body[update];
				});

				await necessary.save();

				res.status(StatusCodes.OK).json(necessary);
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [DELETE] /necessaries/:id
	async deleteNecessaryByID(req, res, next) {
		try {
			if (req.priority === 1) {
				const { id } = req.params;
				const necessary = await Necessary.findByIdAndDelete(id);
				res.status(StatusCodes.NO_CONTENT).json();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}

	// [POST] /necessaries/:id/uploadImage
	async uploadNecessaryImage(req, res, next) {
		try {
			if (req.priority === 1) {
				const { id } = req.params;
				const necessary = await Necessary.findById(id);

				if (!necessary) {
					throw new NotFoundError('Necessary not found');
				}
				if (!req.body.image) {
					throw new NotFoundError('Image not found');
				}

				const uploadedRes = await cloudinary.uploader.upload(req.body.image, {
					upload_preset: 'covid_manager_web'
				});
				// get url of uploaded image
				const image = uploadedRes.secure_url;
				necessary.image = image;

				await necessary.save();

				res.status(StatusCodes.OK).send();
			} else {
				throw new UnauthorizedError('You are not manager');
			}
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new NecessaryController();
