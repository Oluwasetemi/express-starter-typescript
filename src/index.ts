import dotenv from 'dotenv';
import logger, { LogLevelDesc } from 'loglevel';
import startServer from './start';

dotenv.config();

const isTest = process.env.NODE_ENV !== 'test';
const logLevel =
	(process.env.LOG_LEVEL as LogLevelDesc) || ((isTest ? 'warn' : 'info') as LogLevelDesc);

logger.setLevel(logLevel);

startServer();
