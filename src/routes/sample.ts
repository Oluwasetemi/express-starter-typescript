/* istanbul ignore file */

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();
import express from 'express';
import * as sampleController from '../controllers/sample';

function getSampleRoutes() {
	const router = express.Router();

	/**
	 * @swagger
	 * /api/sample:
	 *   get:
	 *     summary: hello endpoint
	 *     tags: [Sample]
	 *     parameters:
	 *       - in: query
	 *         name: name
	 *         schema:
	 *           type: string
	 *           required: true
	 *           summary: The name of the person
	 *       - in: query
	 *         name: age
	 *         schema:
	 *           type: number
	 *           required: true
	 *           summary: The name of the person
	 *     responses:
	 *       200:
	 *         description: Token deleted successful
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 example:
	 *                   type: string
	 *                 age:
	 *                   type: number
	 *                 name:
	 *                   type:  string
	 *       400:
	 *         description: name and age is required
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Error'
	 */
	router.get('/', sampleController.hello);

	/**
	 * @swagger
	 * definitions:
	 *   Error:
	 *     required:
	 *       - username
	 *       - password
	 *     properties:
	 *       message:
	 *         type: string
	 *       errors:
	 *         type: string
	 *       path:
	 *         loading: boolean
	 *       error:
	 *         loading: boolean
	 *       statusCode:
	 *         loading: number
	 */

	/**
	 * @swagger
	 * tags:
	 *   - name: Sample
	 *     description: a sample route
	 *     docExpansion: none
	 */

	/**
	 * @swagger
	 * /api/sample/test:
	 *   post:
	 *     summary: test if the api is working
	 *     tags: [Sample]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: false
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               name:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: show an object with key hello and value to be name or stranger
	 *         schema:
	 *           type: object
	 *           properties:
	 *               hello: string
	 *       400:
	 *         description: Name parameter not passed along in the request body
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Error'
	 */

	router.post('/test', sampleController.test);

	return router;
}

export default getSampleRoutes;
