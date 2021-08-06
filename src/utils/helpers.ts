import { User } from '@prisma/client';

/**
 * Returns the user data without the password field
 * @param {User} a user object
 * @returns {Omit<User, "password">} the user data without password
 */
export function cleanupPassword(obj: User): Omit<User, 'password'> {
	const { password, ...result } = obj;
	return result;
}

/**
 * generate random token
 * @param length the length of the token. default is 6
 * @returns {string} token generated
 */
export function generateToken(length: number = 6): string {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i += 1) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

/**
 * the full name of a user
 * @param fName user first name
 * @param lName user last name
 * @returns {string} concatenated name of the user
 */
export function fullName({ fName, lName }: { fName: string; lName: string }): string {
	return `${fName.toUpperCase} ${lName.toUpperCase}}`;
}
