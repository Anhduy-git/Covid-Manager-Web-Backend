module.exports = {
	port: process.env.PORT,
	mongodb_url: process.env.MONGODB_URL_PROD,
	jwt_secret: process.env.JWT_SECRET_PROD,
	cloudinary_name: process.env.CLOUDINARY_NAME_PROD,
	cloudinary_api_key: process.env.CLOUDINARY_API_KEY_PROD,
	cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET_PROD,
	sendgrid_api_key: process.env.SENDGRID_API_KEY_PROD,
	payment_manager_url: process.env.PAYMENT_MANAGER_URL_PROD
};
