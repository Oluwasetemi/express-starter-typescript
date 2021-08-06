/* eslint-disable import/order */
import dotenv from 'dotenv';
import { htmlToText } from 'html-to-text';
import juice from 'juice';
import nodemailer from 'nodemailer';
import path from 'path';
import pug from 'pug';
/* eslint-enable */

dotenv.config();

// const nodemailer = require('nodemailer');
// const sgMail = require('@sendgrid/mail');

// if (!process.env.SENDGRID_SECRET_KEY) {
//   throw new Error('Enter the secret key of sendgrid');
// }

// sgMail.setApiKey(process.env.SENDGRID_SECRET_KEY);

// if (!process.env.MAILJET_API_KEY && !process.env.MAILJET_SECRET_KEY) {
//   throw new Error('Enter the secret key of the mailjet');
// }

if (!process.env.SMTP_FROM_EMAIL && !process.env.SMTP_FROM_NAME) {
	throw new Error('Enter the secret key of the mailjet sender email and name');
}

// const mailjet = require('node-mailjet').connect(
//   process.env.MAILJET_API_KEY,
//   process.env.MAILJET_SECRET_KEY
// );

const transportOptions: any = {
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: false,
	requireTLS: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
	tls: {
		rejectUnauthorized: false,
	},
	// logger: true,
};

const transport = nodemailer.createTransport(transportOptions);

const generateHTML = (filename: string, options = {}) => {
	const html = pug.renderFile(path.join(__dirname, `/templates/${filename}.pug`), options);
	const inlined = juice(html);
	return inlined;
};

/**
 * send email
 * @param {obj} options includes the filename, to, subject, variables to use in the email template
 * @example await send({
 *      filename: 'emailTemplate',
 *      to: recipients email,
 *      subject: 'hello',
 *      data1: value1,
 *      data2: value2,
 *      data3: value3,
 * })
 * @returns {obj} result of sending mail and the message (mail content)
 */
export const send = async (options: {
	filename: string;
	to: string;
	subject: string;
	title?: string;
	name?: string;
	companyName?: string;
	link?: string;
	resetLink?: string;
	activateLink?: string;
	verifyLink?: string;
	loginLink?: string;
	description?: string;
	hostname?: string;
	datetime?: string;
	professional?: string;
	type?: string;
	purpose?: string;
	email?: string;
}) => {
	try {
		// const HTMLPart = generateHTML(options.filename, options);
		// const TextPart = htmlToText.fromString(HTMLPart);

		// const mailOptions = {
		//   From: {
		//     Email: process.env.SMTP_FROM_EMAIL,
		//     Name: process.env.SMTP_FROM_NAME,
		//   },
		//   To: [{ email: options.to }],
		//   Subject: options.subject || 'Email from Choose Life',
		//   TextPart,
		//   HTMLPart,
		// };
		const html = generateHTML(options.filename, options);
		const text = htmlToText(html);

		const mailOptions: any = {
			from: {
				address: process.env.SMTP_FROM_EMAIL,
				name: process.env.SMTP_FROM_NAME,
			},
			// name: process.env.SMTP_FROM_NAME,
			to: [{ address: options.to, name: options.name }],
			subject: options.subject || 'Email from Groovy App',
			text,
			html,
		};

		if (process.env.NODE_ENV === 'test') {
			return;
		}

		// const res = await sgMail.send(mailOptions);

		// const res = await mailjet
		//   .post('send', { version: 'v3.1' })
		//   .request({ Messages: [mailOptions] });
		const res = await transport.sendMail(mailOptions);

		return res;
	} catch (error) {
		// console.log(error);
		// console.log(error.message);
		throw new Error('problem sending email📪');
	}
};

const makeANiceEmail = (text: string) => `
    <div class="email" styles="
        border: 1px solid black;
        padding: 20px;
        font-family: sans-serif;
        line-height: 2;
        font-size: 20px;
    ">
        <h2>Hello There!</h2>
        <p>${text}</p>

        <p>🤟🏼, Temi</p>
    </div>
`;

exports.transport = transport;
exports.makeANiceEmail = makeANiceEmail;
