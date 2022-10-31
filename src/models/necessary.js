const mongoose = require('mongoose');

const necessarySchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	price: {
		type: Number,
		min: 0,
		required: true
	},
	unit: {
		type: String,
		required: true
	},
	image: {
		type: String
	}
});
const Necessary = mongoose.model('Necessary', necessarySchema);

module.exports = Necessary;
