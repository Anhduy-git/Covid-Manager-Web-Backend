const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	districts: [
		{
			// type: mongoose.Schema.Types.ObjectId,
			// ref: 'District',
			// required: true
			name: {
				type: String,
				trim: true,
				required: true
			},
			wards: [
				{
					name: {
						type: String,
						trim: true,
						required: true
					}
				}
			]
		}
	]
});
const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
