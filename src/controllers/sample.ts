import { Request, Response } from 'express';

export const hello = (req: Request, res: Response) => {
	if (!req.query.name && !req.query.age) {
		return res.status(400).send({
			error: true,
			loading: false,
			statusCode: 400,
			description: 'name and age is required',
		});
	}
	const { age, name } = req.query;
	res.status(200).json({ example: 'is-working', age, name });
};

export const test = (req: Request, res: Response) => {
	const { name } = req.body;

	if (!name) {
		return res.status(400).send({
			error: true,
			loading: false,
			statusCode: 400,
			description: 'Name parameter not passed along in the request body',
		});
	}
	return res.status(200).json({ hello: `${name || 'stranger!'}` });
};
