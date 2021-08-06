import bodyParser from 'body-parser';
import cors from 'cors';
// import { getLocalStrategy } from './utils/auth'
import dotenv from 'dotenv';
import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import hpp from 'hpp';
import logger from 'loglevel';
import * as swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middlewares/error-middleware';
import getRouter from './routes';
dotenv.config();

// if the env is test change the database url
if (process.env.NODE_ENV === 'test') {
	process.env.DATABASE_URL = 'mongodb://localhost:27017/groovy_db_test';
}

function startServer({ port = process.env.PORT } = {}): Promise<unknown> {
	const app = express();
	app.use(helmet());
	app.use(cors());
	app.use(bodyParser.json());
	app.use(express.json());
	app.use(hpp());

	// swagger
	const options = {
		definition: {
			openapi: '3.0.0',
			info: {
				title: 'Groovy API Documentation',
				description: 'It list all the API endpoint for the groovy backend',
				version: 'v1',
			},
			docExpansion: 'none',
			license: {
				name: 'MIT',
				url: 'https://spdx.org/licenses/MIT.html',
			},
			contact: {
				name: 'Admin',
				url: 'https://groovy.com',
				email: 'info@groovyapp.com',
			},
		},
		servers: [
			{
				url: '/api',
			},
		],
		apis: [
			`${__dirname}/routes/*.ts`,
			`${__dirname}/routes/parameters.yaml`,
			`${__dirname}/routes/json-schema.json`,
		],
	};

	const specs = swaggerJsdoc.default(options);
	const router = getRouter();
	app.use('/api', router);
	app.use(
		'/',
		swaggerUi.serve,
		swaggerUi.setup(specs, {
			explorer: true,
			swaggerOptions: {
				docExpansion: 'none',
			},
		}),
	);

	app.use(errorMiddleware);

	return new Promise((resolve) => {
		const server = app.listen(port, () => {
			logger.info(`🚀 Listening on port http://localhost:${port}`);
			const originalClose = server.close.bind(server);
			// @ts-ignore
			server.close = () => {
				return new Promise((resolveClose) => {
					originalClose(resolveClose);
				});
			};
			resolve(server);
			// server.close()
		});
	});
}

export default startServer;
