const mongoose = require('mongoose');
const _ = require('underscore');

const transactionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
		necessaryPackages: {
			type: [
				{
					necessaryPackage: {
						type: mongoose.Schema.Types.ObjectId,
						required: true,
						ref: 'NecessaryPackage'
					},
					quantity: {
						type: Number,
						default: 1
					}
				}
			]
		},
		totalPrice: {
			type: Number,
			default: 0
		}
	},
	{
		// date of transaction
		timestamps: true
	}
);

// not allow duplicate
transactionSchema.pre('save', function (next) {
	this.necessaryPackages = _.uniq(
		this.necessaryPackages,
		(x) => x.necessaryPackage
	);
	next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
