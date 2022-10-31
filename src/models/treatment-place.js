const mongoose = require('mongoose');
const { BadRequestError } = require('../errors');

const treatmentPlaceSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	capacity: {
		type: Number,
		min: 1,
		required: true
	},
	currentPatients: {
		type: Number,
		min: 0,
		required: true,
		validate(value) {
			if (value > this.capacity) {
				throw new BadRequestError(
					'Number of patients is bigger than capacity!'
				);
			}
		}
	}
});
const TreatmentPlace = mongoose.model('TreatmentPlace', treatmentPlaceSchema);

module.exports = TreatmentPlace;
