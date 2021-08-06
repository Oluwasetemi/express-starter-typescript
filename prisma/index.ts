import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// eslint-disable-next-line require-await
prisma.$use(async (params, next) => {
	// Check incoming query type
	if (
		params.model == 'User' ||
		'Address' ||
		'Location' ||
		'Expenses' ||
		'ExpenseItem' ||
		'Inventory' ||
		'Company' ||
		'Price' ||
		'Wallet' ||
		'Token' ||
		'Transaction' ||
		'Subscription'
	) {
		if (params.action == 'delete') {
			// Delete queries
			// Change action to an update
			params.action = 'update';
			params.args['data'] = { deleted: true };
		}
		if (params.action == 'deleteMany') {
			// Delete many queries
			params.action = 'updateMany';
			if (params.args.data != undefined) {
				params.args.data['deleted'] = true;
			} else {
				params.args['data'] = { deleted: true };
			}
		}
	}
	return next(params);
});
