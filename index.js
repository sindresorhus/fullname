'use strict';
const mem = require('mem');
const execa = require('execa');
const passwdUser = require('passwd-user');
const pAny = require('p-any');
const filterObj = require('filter-obj');

const environmentVariables = [
	'GIT_AUTHOR_NAME',
	'GIT_COMMITTER_NAME',
	'HGUSER', // Mercurial
	'C9_USER' // Cloud9
];

/* eslint-disable unicorn/error-message */
async function checkEnv() {
	const {env} = process;
	const variableName = environmentVariables.find(variable => env[variable]);
	const fullName = variableName && env[variableName];

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkAuthorName() {
	const fullName = require('rc')('npm')['init-author-name'];

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkPasswd() {
	const user = await passwdUser();

	if (!user.fullName) {
		throw new Error();
	}

	return user.fullName;
}

async function checkGit() {
	const fullName = await execa.stdout('git', [
		'config',
		'--global',
		'user.name'
	]);

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkOsaScript() {
	const fullName = await execa.stdout('osascript', [
		'-e',
		'long user name of (system info)'
	]);

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkWmic() {
	const stdout = await execa.stdout('wmic', [
		'useraccount',
		'where',
		`name="${process.env.USERNAME}"`,
		'get',
		'fullname'
	]);

	const fullName = stdout.replace('FullName', '').trim();

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkGetEnt() {
	const result = await execa.shell('getent passwd $(whoami)');
	const fullName = (result.stdout.split(':')[4] || '').replace(/,.*/, '');

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}
/* eslint-enable unicorn/error-message */

async function fallback() {
	if (process.platform === 'darwin') {
		return pAny([checkPasswd(), checkOsaScript()]);
	}

	if (process.platform === 'win32') {
		// The full name is usually not set by default in the system on Windows 7+
		return pAny([checkGit(), checkWmic()]);
	}

	return pAny([checkPasswd(), checkGetEnt(), checkGit()]);
}

async function getFullName() {
	try {
		return await checkEnv();
	} catch (_) {}

	try {
		return await checkAuthorName();
	} catch (_) {}

	try {
		return await fallback();
	} catch (_) {}
}

module.exports = mem(getFullName, {
	cachePromiseRejection: false,
	cacheKey() {
		return JSON.stringify(filterObj(process.env, environmentVariables));
	}
});
