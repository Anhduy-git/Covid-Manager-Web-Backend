const { StatusCodes } = require('http-status-codes');
const Address = require('../models/address');
const { NotFoundError } = require('../errors');

class AddressController {
	// [GET] /addresses/
	async getAddressList(req, res, next) {
		try {
			const addresses = await Address.find({});
			if (!addresses) {
				throw new NotFoundError('List of addresses not found');
			}
			res.status(StatusCodes.OK).json(addresses);
		} catch (err) {
			next(err);
		}
	}
}

module.exports = new AddressController();
