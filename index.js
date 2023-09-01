import process from 'node:process';
import mem from 'mem';
import {execa} from 'execa';
import {passwdUser} from 'passwd-user';
import pAny from 'p-any';
import {includeKeys} from 'filter-obj';
import rc from 'rc';

const environmentVariables = [
	'GIT_AUTHOR_NAME',
	'GIT_COMMITTER_NAME',
	'HGUSER', // Mercurial
	'C9_USER', // Cloud9
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
	const fullName = rc('npm')['init-author-name'];

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
	const {stdout: fullName} = await execa('git', [
		'config',
		'--global',
		'user.name',
	]);

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkOsaScript() {
	const {stdout: fullName} = await execa('osascript', [
		'-e',
		'long user name of (system info)',
	]);

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkWmic() {
	const {stdout} = await execa('wmic', [
		'useraccount',
		'where',
		`name="${process.env.USERNAME}"`,
		'get',
		'fullname',
	]);

	const fullName = stdout.replace('FullName', '').trim();

	if (!fullName) {
		throw new Error();
	}

	return fullName;
}

async function checkGetEnt() {
	const result = await execa('getent passwd $(whoami)', {shell: true});
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
	} catch {}

	try {
		return await checkAuthorName();
	} catch {}

	try {
		return await fallback();
	} catch {}
}

const fullName = mem(getFullName, {
	cachePromiseRejection: false,
	cacheKey() {
		return JSON.stringify(includeKeys(process.env, environmentVariables));
	},
});

export default fullName;
