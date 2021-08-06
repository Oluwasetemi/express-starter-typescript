import { ExpenseItem, Prisma } from '@prisma/client';
import Joi, { ValidationOptions, ValidationResult } from 'joi';
import JoiObjectId from 'joi-objectid';
import { fromPairs } from 'lodash';
const ObjectId = JoiObjectId(Joi);

/**
 * @summary a format function to format the error output in the validator
 * @param {string} message a message to format
 * @returns {string} formatted response
 */
function format(message: string): string {
	return message.replace('"', '').replace('"', '');
}

/**
 * Format Errors
 * @param {object} result error from Joi validate
 * @returns {object} formatted Errors
 */
const formatErrors = (result: { details: any[] }) => {
	if (result) {
		const array = result.details.map((error) => ({
			[error.context.label]: format(error.message),
		}));
		const arrayOfLabelMessage = array.map((error) => {
			const errorLabel = Object.keys(error);
			// @ts-ignore
			const errorMessage = error[errorLabel[0]];
			return [errorLabel, errorMessage];
		});
		const errors = fromPairs(arrayOfLabelMessage);

		return { errors, type: 'Check the information you are sending' };
	}
};

const validate = (
	input: any,
	schema: {
		validate: (value: any, options?: ValidationOptions | undefined) => ValidationResult;
	},
) => {
	const { error, value } = schema.validate(input, { abortEarly: false });
	if (error) {
		const newError = formatErrors(error);
		throw newError;
	}

	return value;
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const registerCustomer = (customer: Prisma.UserCreateArgs): Joi.ValidationResult => {
	const schema = Joi.object({
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		password: Joi.string().min(6).max(10).required(),
		phone: Joi.string().min(11).max(14).required(),
		email: Joi.string().email().required(),
	});

	return validate(customer, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const loginCustomer = (input: { password: string; email: string }): Joi.ValidationResult => {
	const schema = Joi.object({
		password: Joi.string()
			.min(6)

			.required(),
		email: Joi.string()
			.email()

			.required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const forgotPassword = (input: { email: string }) => {
	const schema = Joi.object({
		email: Joi.string()
			.email()

			.required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const resetPassword = (input: {
	password: string;
	'password-confirm': string;
	token: string;
}) => {
	const schema = Joi.object({
		password: Joi.string()
			.min(6)

			.required(),
		'password-confirm': Joi.string()
			.required()

			.valid(Joi.ref('password')),
		token: Joi.string().required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const changePassword = (input: { 'old-password': string; 'new-password': string }) => {
	const schema = Joi.object({
		'old-password': Joi.string()
			.min(6)

			.required(),
		'new-password': Joi.string()
			.required()

			.valid(Joi.ref('password')),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const updateUser = (input: {}) => {
	const schema = Joi.object({
		firstName: Joi.string(),
		lastName: Joi.string(),
		password: Joi.string().min(6),
		mobile: Joi.string()
			.min(11)

			.max(14),
		email: Joi.string().email(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const createLocation = (input: {}) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string(),
		// address: Joi.object({
		// 	addressLine: Joi.string(),
		// 	city: Joi.string(),
		// 	state: Joi.string(),
		// 	country: Joi.string(),
		// }).required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const updateLocation = (input: {}) => {
	const schema = Joi.object({
		name: Joi.string(),
		description: Joi.string(),
		addressId: ObjectId(),
		address: {
			addressLine: Joi.string(),
			city: Joi.string(),
			state: Joi.string(),
			country: Joi.string(),
		},
	});

	return validate(input, schema);
};

/**
 * Validate the data of a customer to be registered
 * @param customer {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const address = (input: {}) => {
	const schema = Joi.object({
		addressLine: Joi.string(),
		city: Joi.string(),
		state: Joi.string(),
		country: Joi.string(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of creating a business
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const createBusiness = (input: {}): Joi.ValidationResult => {
	const schema = Joi.object({
		name: Joi.string().required(),
		category: Joi.string().required(),
		phone: Joi.string().min(11).max(14).required(),
		email: Joi.string().email().required(),
		address: Joi.object({
			id: ObjectId(),
			addressLine: Joi.string(),
			city: Joi.string(),
			state: Joi.string(),
		}).required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of updating a business
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const business = (input: {}): Joi.ValidationResult => {
	const schema = Joi.object({
		name: Joi.string(),
		category: Joi.string(),
		phone: Joi.string().min(11).max(14),
		email: Joi.string().email(),
		// address: Joi.object({
		// 	addressLine: Joi.string(),
		// 	city: Joi.string(),
		// 	state: Joi.string(),
		// }).required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of adding a new staff
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const addNewStaff = (input: {}): Joi.ValidationResult => {
	const schema = Joi.object({
		firstName: Joi.string().required(),
		lastName: Joi.string().required(),
		// password: Joi.string().min(6).required(),
		phone: Joi.string().min(11).max(14),
		email: Joi.string().email(),
		// companyId: ObjectId().required(),
		role: Joi.string().required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of funding a wallet
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const fundWallet = (input: {}): Joi.ValidationResult => {
	const schema = Joi.object({
		transactionRef: Joi.string().required(),
		amount: Joi.number().required(),
		companyId: ObjectId().required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of creating an expenses
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const expense = (input: {
	name: string;
	description: string;
	totalAmount: number;
	item: Array<ExpenseItem>;
}) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required(),
		totalAmount: Joi.number().required(),
		items: Joi.array()
			.items({
				name: Joi.string(),
				rate: Joi.number().required(),
				inventoryId: ObjectId().required(),
				// locationId: ObjectId().required(),
			})
			.required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of funding a wallet
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const createTransaction = (input: {
	amount: number;
	type: string;
	item: Array<ExpenseItem>;
}) => {
	const schema = Joi.object({
		type: Joi.string(),
		amount: Joi.number(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of funding a wallet
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const createToken = (input: { value: number; status: string; locationId: string }) => {
	const schema = Joi.object({
		companyId: ObjectId().required(),
		value: Joi.number().required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of funding a wallet
 * @param input {Prisma.UserCreateArgs} customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const token = (input: { value: number; status: string; companyId: string; for: string }) => {
	const schema = Joi.object({
		status: Joi.string(),
		value: Joi.number(),
		companyId: ObjectId(),
		for: Joi.string(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of creating an inventory
 * @param input customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const createInventory = (input: {}) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		type: Joi.string().required(),
		measurement: Joi.string().required(),
		quantity: Joi.number().required(),
		unitPrice: Joi.number().required(),
		sellingPrice: Joi.number().required(),
		locationId: ObjectId().required(),
	});

	return validate(input, schema);
};

/**
 * Validate the data of creating a checkout
 * @param input customer data to validate during register
 * @returns {Joi.ValidationResult}
 */
export const checkout = (input: {}) => {
	const schema = Joi.object({
		amount: Joi.number().required(),
		// userId: ObjectId().required(),
		companyId: ObjectId(),
	});

	return validate(input, schema);
};
