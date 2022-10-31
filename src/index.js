const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const fs = require('fs');
const route = require('./routers');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const initializeDB = require('./db/db-initialize');
const connectDB = require('./db/db-connect');
const config = require('./config');
const { NotFoundError } = require('./errors');

const app = express();

// parse req.body to js object, set limit data size
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// CORS
app.use(cors());

// initialize database (addresses, places of treament,..)
initializeDB();

// Port
const { port } = config;
const securePort = Number(port) + 443;

// //redirect to secure port middleware
// app.all('*', (req, res, next) =>{
// 	if (req.secure) {
// 		return next();
// 	} else {
// 		res.redirect(StatusCodes.TEMPORARY_REDIRECT, 'https://'
// 		+ req.hostname + ':' + app.get('securePort') + req.url);
// 	}
// })

// init routers
route(app);
// No route is found
app.use((req, res, next) => {
	throw new NotFoundError('URL not found!');
});

// error handlers
app.use(errorHandlerMiddleware);

const options = {
	key: fs.readFileSync(`${__dirname}/bin/private.key`),
	cert: fs.readFileSync(`${__dirname}/bin/certificate.pem`)
};

// http server
const httpServer = http.createServer(app);
// https server
const httpsServer = https.createServer(options, app);

const startServer = async () => {
	try {
		await connectDB(config.mongodb_url);
		httpServer.listen(port, () =>
			console.log(`Server is listening on port ${port}...`)
		);
	} catch (err) {
		console.log('Internal Server Error');
	}
};

startServer();
