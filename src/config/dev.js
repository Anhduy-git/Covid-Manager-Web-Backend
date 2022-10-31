module.exports = {
	port: process.env.PORT,
	mongodb_url: process.env.MONGODB_URL_DEV,
	jwt_secret: process.env.JWT_SECRET_DEV,
	cloudinary_name: process.env.CLOUDINARY_NAME_DEV,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY_DEV,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET_DEV,
	sendgrid_api_key: process.env.SENDGRID_API_KEY_DEV,
	payment_manager_url: process.env.PAYMENT_MANAGER_URL_DEV
};
