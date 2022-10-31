const mongoose = require('mongoose');
const _ = require('underscore');
const { BadRequestError } = require('../errors');
const Necessary = require('./necessary');

const necessaryPackageSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	necessaries: {
		type: [
			{
				necessary: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Necessary'
				},
				quantity: {
					type: Number,
					default: 1
				}
			}
		]
		// ,
		// validate(value){
		//     if (value.length < 2) {
		//         throw new BadRequestError('Package should contain at least 2 necessary');
		//     }
		// }
	},
	limitQuantityOfNecessary: {
		type: Number,
		min: 1
	},
	limitQuantityOfPackageOverTime: {
		type: Number,
		min: 1
	},
	limitTime: {
		type: Number
	},
	totalPrice: {
		type: Number,
		default: 0
	},
	image: {
		type: String
	}
});

// necessaryPackageSchema.pre('save', async function(next) {
//     var totalPrice = 0
//     for (item of this.necessaries) {
//         const necessary = await Necessary.findById(item.necessary);
//         totalPrice += (necessary.price * item.quantity);
//     }
//     this.totalPrice = totalPrice;

//     next(); //go to save the package
// })

// not allow duplicate
necessaryPackageSchema.pre('save', function (next) {
	this.necessaries = _.uniq(this.necessaries, (x) => x.necessary);
	next();
});

const NecessaryPackage = mongoose.model(
	'NecessaryPackage',
	necessaryPackageSchema
);

module.exports = NecessaryPackage;
