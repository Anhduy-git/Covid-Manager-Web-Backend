const { StatusCodes } = require('http-status-codes');
const TreatmentPlace = require('../models/treatment-place');
const { NotFoundError, BadRequestError } = require('../errors');

class TreatmentPlaceController {
	// [POST] /treatmentPlaces
	async createTreatmentPlace(req, res, next) {
		try {
			// just admin can create new treatment place
			if (req.priority === 0) {
				const treatmentPlace = new TreatmentPlace(req.body);
				await treatmentPlace.save();
				res.status(StatusCodes.CREATED).json(treatmentPlace);
			} else {
				throw new BadRequestError(
					'You have no right to do create new treatment place'
				);
			}
		} catch (err) {
			next(err);
		}
	}

	// [GET] /treatmentPlaces
	async getTreatmentPlaceList(req, res, next) {
		try {
			const treatmentPlaces = await TreatmentPlace.find({});
			if (!treatmentPlaces) {
				throw new NotFoundError('List of treatment places not found');
			}
			res.status(StatusCodes.OK).json(treatmentPlaces);
		} catch (err) {
			next(err);
		}
	}

	// [DELETE] /treatmentPlaces/:id
	async deleteTreatmentPlace(req, res, next) {
		try {
			// just admin can create new treatment place
			if (req.priority === 0) {
				const { id } = req.params;
				await TreatmentPlace.findByIdAndDelete(id);
				const treatmentPlaces = await TreatmentPlace.find({});
				res.status(StatusCodes.OK).json(treatmentPlaces);
			} else {
				throw new BadRequestError(
					'You have no right to do create new treatment place'
				);
			}
		} catch (err) {
			next(err);
		}
	}

	// [PATCH] /treatmentPlaces/:id
	async updateTreatmentPlace(req, res, next) {
		try {
			// just admin can update treatment place
			if (req.priority === 0) {
				const updates = Object.keys(req.body);
				const allowedUpdates = ['name', 'capacity', 'currentPatients'];
				const isValidOperation = updates.every((update) =>
					allowedUpdates.includes(update)
				);

				if (!isValidOperation) {
					throw new BadRequestError('Invalid update operation');
				}

				const { id } = req.params;
				const treatmentPlace = await TreatmentPlace.findById(id);
				if (!treatmentPlace) {
					throw new NotFoundError('Treatment place not found');
				}

				updates.forEach((update) => {
					treatmentPlace[update] = req.body[update];
				});
				await treatmentPlace.save();

				res.status(StatusCodes.OK).json(treatmentPlace);
			} else {
				throw new BadRequestError(
					'You have no right to do update treatment place'
				);
			}
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new TreatmentPlaceController();
