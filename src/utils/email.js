const sgMail = require('@sendgrid/mail');
const config = require('../config');

sgMail.setApiKey(config.sendgrid_api_key);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		// asynchronous
		to: email,
		from: 'anhduydp123@gmail.com',
		subject: 'Thanks for joining in our Covid Management web',
		text: `Welcome to the web, ${name}`
	});
};
const sendCancelationEmail = (email, name) => {
	sgMail.send({
		// asynchronous
		to: email,
		from: 'anhduydp123@gmail.com',
		subject: 'Sorry to see you go',
		text: `Goodbye ${name}. I hope to see you back sometime soon`
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancelationEmail
};
