declare module 'joi-objectid';

export interface UserPayload {
	id: string;
	email: string;
	role: string;
	iat: string;
	exp: number;
}

declare module Express {
	export interface Request {
		user?: UserPayload;
		fileName: string;
	}
}
