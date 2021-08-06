import express, { Router } from 'express';
import getGeneralRoutes from './general';
import getSampleRoutes from './sample';

function getRouter(): Router {
	const router = express.Router();


	router.use('/', getGeneralRoutes());
	router.use('/sample', getSampleRoutes());

	return router;
}

export default getRouter;
