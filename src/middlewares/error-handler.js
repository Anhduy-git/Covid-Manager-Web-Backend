const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
	const customError = {
		// set default error
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		msg: err.message || 'Internal Server Error!'
	};

	return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware;
