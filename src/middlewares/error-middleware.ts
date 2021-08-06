import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';

export function errorMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
	if (res.headersSent) {
		next(error);
	} else if (error instanceof UnauthorizedError) {
		res.status(401);
		res.json({ code: error.code, message: error.message });
	} else {
		res.status(500);
		res.json({
			message: error.message,
			// we only add a `stack` property in non-production environments
			...(process.env.NODE_ENV === 'production' ? null : { stack: error.stack }),
		});
	}
}

/**
 *
 * Catch Errors Handler
   With async/await, you need some way to catch errors
* Instead of using try{} catch(e) {} in each controller, we wrap the
* function in
* catchErrors(), catch any errors they throw, and along to our express
* middleware with next()
*/

export type ErrorResponse = {
	loading: boolean;
	statusCode: number;
	errors: string | object;
	message: string;
};
/**
 *
 * @param fn Function Accepts a function and catch all the errors it throws
 * @returns {ErrorResponse} error response
 */
export const catchErrors = (
	fn: (
		req: Request,
		res: Response,
		next: NextFunction,
	) => Promise<Response<any, Record<string, any>> | ErrorResponse>,
) => {
	return function (req: Request, res: Response, next: NextFunction) {
		return fn(req, res, next).catch((error: { errors: any; message: any; type: any }) => {
			return res.status(400).json({
				loading: false,
				error: true,
				statusCode: 400,
				errors: error.errors || error.message,
				message: error.message || error.type,
			});
		});
	};
};

/*
Not Found Error Handler
If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
// export function notFound(req, res, next) {
// 	const err = new Error('Not Found');
// 	err.status = 404;
// 	next(err);
// }

/*
Development Error Handler
In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
// export function developmentErrors(err, req, res, _) {
// 	err.stack = err.stack || '';
// 	const errorDetails = {
// 		message: err.message,
// 		status: err.status,
// 		stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
// 	};
// 	res.status(err.status || 500);
// 	return res.json(errorDetails); // Ajax call, send JSON back
// }

/*
Production Error Handler
No stacktraces are leaked to user
*/

// export function productionErrors(err, req, res, _) {
// 	res.status(err.status || 500);
// 	return res.json({
// 		message: err.message,
// 		error: {},
// 	});
// }

// export default errorMiddleware;
