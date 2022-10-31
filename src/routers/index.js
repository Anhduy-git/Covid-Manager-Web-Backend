const authRouter = require('./authentication');
const userManagerRouter = require('./user-manager');
const userRouter = require('./user');
const treatmentPlaceRouter = require('./treatment-place');
const addressRouter = require('./address');
const necessaryRouter = require('./necessary');
const necessaryPackageRouter = require('./necessary-package');

function route(app) {
	// routers
	app.use('/auth', authRouter);
	app.use('/managers', userManagerRouter);
	app.use('/users', userRouter);
	app.use('/treatmentPlaces', treatmentPlaceRouter);
	app.use('/addresses', addressRouter);
	app.use('/necessaries', necessaryRouter);
	app.use('/necessaryPackages', necessaryPackageRouter);
}

module.exports = route;
