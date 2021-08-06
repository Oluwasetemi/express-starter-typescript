import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import expressJWT from 'express-jwt';
import { sign, verify } from 'jsonwebtoken';

dotenv.config();

if (!process.env.TOKEN_SECRET) {
	throw Error('Please set a TOKEN_SECRET in the environment variable');
}

const secret = process.env.TOKEN_SECRET;

// reducing the iterations to 1 in non-production environments to make it faster
const iterations = process.env.NODE_ENV === 'production' ? 10 : 1;

// seconds/minute * minutes/hour * hours/day * 60 days
const sixtyDaysInSeconds = 60 * 60 * 24 * 60;
// to keep our tests reliable, we'll use the requireTime if we're not in production
// and we'll use Date.now() if we are.
const requireTime = Date.now();
const now = () => (process.env.NODE_ENV === 'production' ? Date.now() : requireTime);

/**
 * generates a token for a user
 * @function
 * @param {string} id - id of the user.
 * @param {string} email - email of the user.
 * @param {string} role - role of the user.
 * @returns {string} token - for authenticating the user.
 */

export const getUserToken = (id: string, email: string, role: string): string => {
	const issuedAt = Math.floor(now() / 1000);
	return sign(
		{
			id,
			email,
			role,
			iat: issuedAt,
			exp: process.env.NODE_ENV === 'production' ? issuedAt + sixtyDaysInSeconds : 9999999999,
		},
		process.env.TOKEN_SECRET,
	);
};

/**
 * authenticates a token
 * @function
 * @param {string} token - user token.
 * @returns {Promise<object>} decoded - authenticated user details.
 */

export const verifyToken = (token: string): Promise<object> => {
	return new Promise((resolve, reject) => {
		verify(token, process.env.TOKEN_SECRET, (err: any, decoded: object | PromiseLike<object>) => {
			if (err) return reject(err);

			return resolve(decoded);
		});
	});
};

/**
 * hashes a user's password
 * @function
 * @param {string} password - user password.
 * @returns {Promise<string>} hashed - a hashed password
 */
export const hash = async (password: string): Promise<string> => {
	const saltRounds = iterations;
	return bcrypt.hash(password, saltRounds);
};

/**
 *  compares a user's password with the hashed version
 * @param {string} password user password
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} match - the boolean of the password compare
 */
export const isPasswordValid = (password: string, hashedPassword: string): Promise<boolean> => {
	return bcrypt.compare(password, hashedPassword);
};

export const authMiddleware = expressJWT({ algorithms: ['HS256'], secret });
