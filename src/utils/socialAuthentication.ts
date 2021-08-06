// import faker from 'faker';
// // const TwitterStrategy = require('passport-twitter-token')
// import passport from 'passport';
// import FacebookStrategy from 'passport-facebook-token';
// import GoogleStrategy from 'passport-google-plus-token';
// import User from '../models/user';
// import * as Auth from '../utils/auth';

// export const passportCustom = (strategy) => (req, res, next) =>
// 	passport.authenticate(strategy, (err, user, _) => {
// 		if (err) {
// 			return res.status(400).send({ err });
// 		}
// 		return next();
// 	})(req, res, next);

// if (!process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
// 	throw Error('Enter the google secret in the env file');
// }

// passport.use(
// 	'googleToken',
// 	new GoogleStrategy(
// 		{
// 			clientID: process.env.GOOGLE_CLIENT_ID,
// 			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 			passReqToCallback: true,
// 		},
// 		async (req, accessToken, refreshToken, profile, done) => {
// 			try {
// 				const existingUser = await User.findOne({
// 					email: profile.emails[0].value,
// 					type: req.body.type,
// 				});
// 				if (existingUser) {
// 					req.user = existingUser;
// 					return done(null, existingUser);
// 				}
// 				const hash = await Auth.hash('123456');
// 				const user = await new User({
// 					type: req.body.type,
// 					name: profile.displayName,
// 					image: profile.photos[0].value,
// 					email: profile.emails[0].value,
// 					password: hash,
// 					verified: true,
// 					source: 'google',
// 					//address
// 					mobile: profile.phoneNumber || `${faker.phone.phoneNumber()}`,
// 				}).save();
// 				req.user = user;
// 				return done(null, user);
// 			} catch (error) {
// 				return done(error, false, error.message);
// 			}
// 		},
// 	),
// );

// if (!process.env.FACEBOOK_CLIENT_ID && !process.env.FACEBOOK_CLIENT_SECRET) {
// 	throw Error('Enter the facebook secret in the env file');
// }

// passport.use(
// 	'facebookToken',
// 	new FacebookStrategy(
// 		{
// 			clientID: process.env.FACEBOOK_CLIENT_ID,
// 			clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
// 			passReqToCallback: true,
// 		},
// 		async (req, accessToken, refreshToken, profile, done) => {
// 			try {
// 				const existingUser = await User.findOne({
// 					email: profile.emails[0].value,
// 				});
// 				if (existingUser) {
// 					req.user = existingUser;
// 					return done(null, existingUser);
// 				}
// 				const hash = await Auth.hash('12345');
// 				const user = await new User({
// 					type: req.body.role,
// 					name: profile.displayName,
// 					image: profile.photos[0].value,
// 					email: profile.emails[0].value,
// 					password: hash,
// 					verified: true,
// 					source: 'facebook',
// 					//address
// 					//mobile
// 				}).save();
// 				return done(null, user);
// 			} catch (error) {
// 				return done(error, false, error.message);
// 			}
// 		},
// 	),
// );
