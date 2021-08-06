import * as crypto from 'crypto';
import { isBefore } from 'date-fns';
import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { UserPayload } from '../@typings/express';
import { send } from '../mail/mail';
import * as Authentication from '../utils/auth';
import { cleanupPassword, fullName } from '../utils/helpers';
import paystack from '../utils/paystack';
import * as validator from '../utils/validator';

// export const verifyUserEmail = async (req: Request, res: Response) => {
// 	// validate the request.params to contain the type and verificationToken
// 	await validator.verifyUserEmail(req.params);

// 	const verified = await userService.verifyUser(req.params.verificationToken);

// 	if (!verified) throw new Error('User verified already');

// 	await send({
// 		filename: 'verify',
// 		to: verified.email,
// 		subject: 'VERIFIED',
// 		name: verified.name,
// 		link: `${process.env.WEB_TEST_URL}`,
// 		hostname: `${process.env.WEB_TEST_URL}`,
// 		email: verified.email,
// 	});

// 	const token = await Authentication.sign(verified._id, verified.email, verified.role);

// 	res.setHeader('x-access-token', token);
// 	delete verified._doc.password;

// 	return res.status(200).json({
// 		loading: false,
// 		statusCode: 200,
// 		message: 'User verification successful',
// 		token,
// 		data: {
// 			...verified._doc,
// 		},
// 	});
// };

/**
 * Grants a customer user access to the application
 * Ensures all fields are not empty
 * Ensures all field input satisfy validation rules
 * @param {Request} req request object
 * @param {Response} res response object
 * @param {NextFunction} next call next middleware
 * @return {Object} res
 */
export const login = async (req: Request, res: Response) => {
	await validator.loginCustomer(req.body);
	const { email, password } = req.body;

	const user = await prisma.user.findFirst({
		where: {
			email: email,
		},
	});

	if (!user) throw new Error('User does not exist');

	const match = await Authentication.isPasswordValid(password, user.password);

	if (!match) throw new Error('Username or password incorrect');

	// if (!user.verified) {
	//     throw new Error('User needs to be verified');
	// }

	const token = Authentication.getUserToken(user.id, user.email, user.role);

	res.setHeader('authorization', `Bearer ${token}`);

	const result = cleanupPassword(user);

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'Login successful',
		token: `Bearer ${token}`,
		data: { ...result },
	});
};

export const forgot = async (req: Request, res: Response) => {
	await validator.forgotPassword(req.body);
	const { email } = req.body;

	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!user) throw new Error('please try again');

	const resetToken = String(crypto.randomInt(0, 1000000));
	const resetTokenExpires = String(Date.now() + 3600000 * 24); // expires in one day(24 hours)
	const resetTokenAt = new Date().toISOString();

	await prisma.user.update({
		where: { id: user.id },
		data: { resetToken, resetTokenExpires, resetTokenAt },
	});

	await send({
		filename: 'request-reset',
		to: user.email,
		subject: 'PASSWORD RESET REQUEST',
		name: fullName({ fName: user.firstName, lName: user.lastName }),
		resetLink: `${process.env.WEB_TEST_URL}/reset-password?token=${user.resetToken}`,
		hostname: `${process.env.APP_URL || 'groovy app'}`,
		email: user.email,
	});

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'Password reset request successful. Check your email',
	});
};

export const resetPassword = async (req: Request, res: Response) => {
	await validator.resetPassword({
		password: req.body.password,
		'password-confirm': req.body['password-confirm'],
		token: req.body.token,
	});

	// find user with token - confirm the token
	const user = await prisma.user.findFirst({
		where: { resetToken: req.params.token },
	});
	// check if resetToken has not expired
	let resetExpiresTime = Number(user.resetTokenExpires);

	if (isBefore(new Date(resetExpiresTime), new Date())) {
		throw new Error('Token has expired');
	}

	const hashedPassword = await Authentication.hash(req.body.password);

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			password: hashedPassword,
			resetTokenAt: null,
			resetTokenExpires: null,
			resetToken: null,
		},
	});

	if (!updatedUser) {
		throw new Error('please try again');
	}

	await send({
		filename: 'reset-successful',
		to: updatedUser.email,
		subject: 'PASSWORD RESET SUCCESSFUL',
		name: fullName({ fName: user.firstName, lName: user.lastName }),
		hostname: `${process.env.APP_URL || 'groovy app'}`,
		email: updatedUser.email,
	});

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'Password reset successful.',
	});
};

export const changePassword = async (req: Request, res: Response) => {
	await validator.changePassword(req.body);
	const { email } = req.user as UserPayload;
	const user = await prisma.user.findUnique({ where: { email: email } });

	if (!user) {
		throw Error('User with the account does not exist');
	}

	const oldPassword = req.body['old-password'];
	const newPassword = req.body['new-password'];

	const compare = await Authentication.isPasswordValid(oldPassword, user.password);

	if (!compare) throw new Error('Old password incorrect');

	const hashedPassword = await Authentication.hash(newPassword);

	user.password = hashedPassword;

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			password: hashedPassword,
		},
	});

	if (!updatedUser) {
		throw new Error('User password changed was not successful');
	}

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'User password changed successfully',
	});
};

export const updateUser = async (req: Request, res: Response) => {
	await validator.updateUser(req.body);
	const { email } = req.user as UserPayload;
	const user = await prisma.user.findUnique({ where: { email: email } });

	if (!user) {
		throw Error('User with the account does not exist');
	}

	// data to be updated
	const dataToBeUpdated: any = {};
	if (req.body['firstName']) dataToBeUpdated.firstName = req.body['firstName'];
	if (req.body['lastName']) dataToBeUpdated.lastName = req.body['lastName'];
	if (req.body['email']) dataToBeUpdated.email = req.body['email'];
	if (req.body['phone']) dataToBeUpdated.phone = req.body['phone'];

	if (req.body['password']) {
		const hashedPassword = await Authentication.hash(req.body['password']);
		dataToBeUpdated.password = hashedPassword;
	}

	const updatedUser = await prisma.user.update({
		where: { id: user.id },
		data: {
			...req.body,
		},
	});

	if (!updatedUser) {
		throw new Error('User update was not successful');
	}

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'User updated successfully',
	});
};

export const updateAddress = async (req: Request, res: Response) => {
	if (!req.params.id) throw new Error('Error fetching one address');
	// validate
	await validator.address(req.body);

	const location = await prisma.location.findFirst({
		where: {
			id: req.params.id,
		},
	});

	if (!location) {
		throw new Error('Error while fetching location');
	}

	// if address is there create a new address and updated the address
	// updated
	// if (req.body['address'])
	const updatedLocation = await prisma.address.update({
		where: {
			id: req.params.id,
		},
		data: {
			...req.body,
		},
	});

	return res.status(200).json({
		loading: false,
		statusCode: 200,
		message: 'Address update successful',
		data: { ...updatedLocation },
	});
};

export const paystackWebHook = async (req: Request, res: Response) => {
	let hash = crypto
		.createHmac('sha512', process.env.PAYSTACK_SECRET)
		.update(JSON.stringify(req.body))
		.digest('hex');

	if (hash === req.headers['x-paystack-signature']) {
		let charge = req.body;
		// console.dir(charge);

		try {
			if (charge.event === 'charge.success') {
				// console.log('===charge.data===');
				// console.dir(charge.data);
				// console.log('===meta===');
				// console.dir(charge.data.metadata);

				// console.log('===custom fields===');
				const { custom_fields } = charge.data.metadata;
				// console.log(custom_fields);

				const { data } = charge;

				const transaction = {
					type: 'CR',
					userId: custom_fields[0]['value'],
					companyId: custom_fields[0]['value'],
					amount: data.amount,
					reference: data.reference,
				};
				// console.log(transaction);

				// add data to transaction here
				const transactionData = prisma.transaction.create({
					data: {
						amount: transaction.amount,
						type: 'CR',
						transactionId: transaction.reference,
						// company: {
						// 	connect: {
						// 		id: transaction.companyId,
						// 	},
						// },
						user: {
							connect: {
								id: transaction.userId,
							},
						},
					},
				});
				// fund-wallet
				const wallet = await prisma.wallet.findFirst({
					where: {
						userId: transaction.userId,
					},
				});

				// console.log(wallet);

				const updatedWallet = prisma.wallet.update({
					where: {
						id: wallet.id,
					},
					data: {
						balance: wallet.balance + transaction.amount,
					},
				});

				await prisma.$transaction([transactionData, updatedWallet]);
			}
		} catch (err) {
			console.log('Error from webhook', err);
		}
	}

	return res.sendStatus(200);
};

export const checkout = async (req: Request, res: Response) => {
	const { id, email } = req.user as UserPayload;
	// validate
	try {
		await validator.checkout(req.body);
	} catch (err) {
		return res.status(400).json({
			...err,
		});
	}
	const { amount } = req.body;

	const metadata = JSON.stringify({
		custom_fields: [
			{
				display_name: 'userId',
				variable_name: 'userId',
				value: id,
			},
			{
				display_name: 'companyId',
				variable_name: 'companyId',
				value: amount,
			},
		],
	});

	paystack.transaction
		.initialize({ amount, email, metadata })
		.then((data: any) => {
			// console.log(data);

			return res.status(200).json({
				...data,
			});
		})
		.catch((err: any) => {
			// console.log(err);
			return res.status(400).json({
				...err,
			});
		});
};

// export const resendVerificationMail = async (req: Request, res: Response) => {
// 	await validator.forgotPassword(req.body);

// 	const user = await userService.findUser({ email: req.body.email });

// 	if (!user) {
// 		throw new Error('user with email not found');
// 	}

// 	if (user.verified) {
// 		throw new Error('user verified already');
// 	}

// 	user.verificationToken = uuidv4();
// 	user.verificationExpires = Date.now() + 3600000 * 24;

// 	await user.save();

// 	await send({
// 		filename: 'resend-verify',
// 		to: user.email,
// 		subject: 'VERIFICATION EMAIL RESENT',
// 		name: user.name,
// 		verifyLink: `${process.env.WEB_TEST_URL}/verify?token=${user.verificationToken}`,
// 		hostname: `${process.env.WEB_TEST_URL || 'https://geniebycova.com'}`,
// 		email: user.email,
// 	});

// 	return res.status(200).json({
// 		loading: false,
// 		statusCode: 200,
// 		message: 'Verification mail resent',
// 	});
// };

// location -> hangout
// post /location
// get /location/:id
// patch /location/:id
// get /location -> search, pagination, sorting
// delete /location/:id

// export const googleUrl = async (req: Request, res: Response) => {
// 	const url = await google.urlGoogle();

// 	if (!url) {
// 		throw new Error('Could not generate auth url');
// 	}

// 	return res.status(200).send({
// 		loading: true,
// 		statusCode: 200,
// 		message: 'Google auth url generate successfully',
// 		url,
// 	});
// };

// export const googleSignup = async (req: Request, res: Response) => {
// 	const gUser = await google.getGoogleAccountFromCode(decodeURIComponent(req.body.code));
// 	let user;
// 	user = await userService.findUser({
// 		email: gUser.email,
// 		source: 'google',
// 	});

// 	if (user) {
// 		if (user.type !== req.body.type) {
// 			throw new Error('User with this google account exist with another type.');
// 		}
// 		const { _id, type, email } = user;
// 		const token = await Authentication.sign(_id, email, type);
// 		user = JSON.parse(JSON.stringify(user));
// 		delete user.password;
// 		return res.status(200).send({
// 			statusCode: 201,
// 			token,
// 			data: user,
// 			message: 'successfully logged in',
// 			loading: false,
// 		});
// 	}

// 	gUser.source = 'google';
// 	gUser.verified = true;
// 	gUser.password = await Authentication.hash('123456');
// 	gUser.type = req.body.type == 'undefined' ? 'holder' : req.body.type;

// 	user = await userService.createUser(gUser);
// 	const { _id, type, email } = user;
// 	const token = await Authentication.sign(_id, email, type);
// 	user = JSON.parse(JSON.stringify(user));
// 	delete user.password;
// 	return res.status(201).send({
// 		message: 'successfully logged in',
// 		loading: false,
// 		statusCode: 201,
// 		token,
// 		data: user,
// 	});
// };

// export const googleSignupWithAccessToken = async (req: Request, res: Response) => {
// 	const options = {
// 		method: 'GET',
// 		uri: 'https://people.googleapis.com/v1/people/me?personFields=addresses,emailAddresses,photos,names,phoneNumbers',
// 		headers: {
// 			Authorization: `Bearer ${req.body.access_token}`,
// 		},
// 	};
// 	let me = await request(options);
// 	me = JSON.parse(me);

// 	const gUser = {};
// 	gUser.email = me.emailAddresses[0].value;
// 	gUser.image = me.photos[0].url;
// 	gUser.name = me.names[0].displayName;

// 	let user;
// 	user = await userService.findUser({
// 		email: gUser.email,
// 		source: 'google',
// 	});

// 	if (user) {
// 		if (user.type !== req.body.type) {
// 			throw new Error('User with this google account exist with another type.');
// 		}
// 		const { _id, type, email } = user;
// 		const token = await Authentication.sign(_id, email, type);
// 		user = JSON.parse(JSON.stringify(user));
// 		delete user.password;
// 		return res.status(200).send({
// 			statusCode: 200,
// 			token,
// 			data: user,
// 			message: 'successfully logged in',
// 			loading: false,
// 		});
// 	}

// 	gUser.source = 'google';
// 	gUser.verified = true;
// 	gUser.password = await Authentication.hash('123456');
// 	gUser.type = req.body.type == 'undefined' ? 'holder' : req.body.type;
// 	gUser.mobile = faker.phone.phoneNumber();

// 	user = await userService.createUser(gUser);
// 	const { _id, type, email } = user;
// 	const token = await Authentication.sign(_id, email, type);
// 	user = JSON.parse(JSON.stringify(user));
// 	delete user.password;
// 	return res.status(201).send({
// 		message: 'New Account successfully logged in',
// 		loading: false,
// 		statusCode: 201,
// 		token,
// 		data: user,
// 	});
// };
