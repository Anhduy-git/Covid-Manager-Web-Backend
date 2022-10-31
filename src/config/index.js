require('dotenv').config();
const productionConfigs = require('./prod');
const developmentConfigs = require('./dev');

if (process.env.NODE_ENV === 'production') {
	console.log('prod');
	module.exports = productionConfigs;
} else if (process.env.NODE_ENV === 'development') {
	console.log('dev');
	module.exports = developmentConfigs;
}
