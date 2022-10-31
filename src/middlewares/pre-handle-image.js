const multer = require('multer');
const DatauriParser = require('datauri/parser');
const path = require('path');

const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new BadRequestError('Please upload jpg, jpeg, or png files'));
		}
		cb(undefined, true); // accept file
	},
	storage: multer.memoryStorage()
});

const multerUpload = upload.single('image');

const parser = new DatauriParser();
const dataUri = (reformatedBuffer) => parser.format('.png', reformatedBuffer);

module.exports = { multerUpload, dataUri };
