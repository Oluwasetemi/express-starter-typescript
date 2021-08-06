const path = require('path');

module.exports = {
	// preset: 'ts-jest',
	displayName: 'server',
	roots: [path.join(__dirname, './src')],
	rootDir: path.join(__dirname, '..'),
	testEnvironment: 'node',
	testMatch: ['**/__tests__/*.*'],
	moduleDirectories: [
		'node_modules',
		__dirname,
		path.join(__dirname, './src'),
		path.join(__dirname, './test'),
	],
	coverageDirectory: path.join(__dirname, '../coverage'),
	collectCoverageFrom: ['**/src/**/*.js'],
	coveragePathIgnorePatterns: ['.*/__tests__/.*'],
	setupFilesAfterEnv: [require.resolve('./test/setup-env.ts')],
	watchPlugins: [
		require.resolve('jest-watch-typeahead/filename'),
		require.resolve('jest-watch-typeahead/testname'),
	],
};
