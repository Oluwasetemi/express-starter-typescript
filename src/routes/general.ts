import express from 'express';
import * as generalController from '../controllers/general';
import { authMiddleware } from '../utils/auth';
// import paystack from '../utils/paystack';
import { catchErrors } from './../middlewares/error-middleware';

function generalRoutes() {
	const router = express.Router();

	/**
	 * @swagger
	 * tags:
	 *   - name: General
	 *     description: all the api routes that is general
	 */

	/**
	 * @swagger
	 * definitions:
	 *   PaystackSuccess:
	 *     properties:
	 *       status:
	 *         type: boolean
	 *       message:
	 *         type: string
	 *       data:
	 *         type: object
	 *         properties:
	 *           authorization_url:
	 *             type: string
	 *           access_code:
	 *             type: string
	 *           reference:
	 *             type: string
	 */

	/**
	 * @swagger
	 * definitions:
	 *   Success:
	 *     properties:
	 *       message:
	 *         type: string
	 *       loading:
	 *         type: boolean
	 *       statusCode:
	 *         type: number
	 */

	/**
	 * @swagger
	 * definitions:
	 *   Error:
	 *     properties:
	 *       message:
	 *         type: string
	 *       errors:
	 *         type: string
	 *       loading:
	 *         type: boolean
	 *       statusCode:
	 *         type: number
	 */

	/**
	 * @swagger
	 * definitions:
	 *   UnauthorizedError:
	 *     properties:
	 *       code:
	 *         type: string
	 *       message:
	 *         type: string
	 */

	/**
	 * @swagger
	 * /api/login:
	 *   post:
	 *     summary: Grants a business owner user access to the application
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               password:
	 *                 type: string
	 *               email:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Login successful
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/SuccessWithDataToken'
	 *       400:
	 *         description: Check the information you are sending
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Error'
	 */
	router.post('/login', catchErrors(generalController.login));

	/**
	 * @swagger
	 * /api/forgot-password:
	 *   post:
	 *     summary: when a user try to reset password
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               email:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Password reset request successful. Check your email
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Success'
	 *       400:
	 *         description: Check the information you are sending
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Error'
	 */
	router.post('/forgot-password', catchErrors(generalController.forgot));

	/**
	 * @swagger
	 * /api/reset-password:
	 *   post:
	 *     summary: reset the user password
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               password:
	 *                 type: string
	 *               password-confirm:
	 *                 type: string
	 *               token:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Password reset successful
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Success'
	 *       400:
	 *         description: Check the information you are sending
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Error'
	 */
	router.post('/reset-password', catchErrors(generalController.resetPassword));

	/**
	 * @swagger
	 * /api/update-user:
	 *   post:
	 *     security:
	 *       - bearerAuth: []
	 *     summary: update the user password
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               firstName:
	 *                 type: string
	 *               lastName:
	 *                 type: string
	 *               email:
	 *                 type: string
	 *               phone:
	 *                 type: string
	 *               password:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: User updated successfully
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Success'
	 *       400:
	 *         description: Check the information you are sending
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Error'
	 */
	router.post('/update-user', authMiddleware, catchErrors(generalController.updateUser));

	/**
	 * @swagger
	 * /api/change-password:
	 *   post:
	 *     security:
	 *       - bearerAuth: []
	 *     summary: change the user password
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               oldPassword:
	 *                 type: string
	 *               newPassword-confirm:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: User password changed successfully
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Success'
	 *       400:
	 *         description: Check the information you are sending
	 *         schema:
	 *           type: object
	 *           $ref: '#/definitions/Error'
	 */
	router.post('/change-password', authMiddleware, catchErrors(generalController.changePassword));

	/**
	 * @swagger
	 * /api/checkout:
	 *   post:
	 *     security:
	 *       - bearerAuth: []
	 *     summary: generate the payment url
	 *     tags: [General]
	 *     produces:
	 *       - application/json
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               amount:
	 *                 type: number
	 *     responses:
	 *       200:
	 *         description: User password changed successfully
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/PaystackSuccess'
	 *       400:
	 *         description: Check the information you are sending
	 *         content:
	 *           application/json:
	 *             schema:
	 *               $ref: '#/definitions/Error'
	 */
	router.post('/checkout', authMiddleware, generalController.checkout);
	/**
	 * the webhook url
	 */
	router.post(
		'/webhook',
		// events.middleware,
		generalController.paystackWebHook,
	);

	return router;
}

export default generalRoutes;
