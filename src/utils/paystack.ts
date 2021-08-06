import paystack from 'paystack-api';

const key =
	process.env.NODE_ENV === 'development'
		? process.env.PAYSTACK_SECRET
		: process.env.PAYSTACK_SECRET;

export default paystack(key);
