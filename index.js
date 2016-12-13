'use strict';

const mem = require('mem');
const execa = require('execa');
const passwdUser = require('passwd-user');
const pAny = require('p-any');

function checkEnv() {
	return new Promise((resolve, reject) => {
		const env = process.env;
		const fullname = env.GIT_AUTHOR_NAME ||
			env.GIT_COMMITTER_NAME ||
			env.HGUSER || // Mercurial
			env.C9_USER; // Cloud9

		if (!fullname) {
			reject();
			return;
		}

		resolve(fullname);
	});
}

function checkAuthorName() {
	return new Promise((resolve, reject) => {
		const fullname = require('rc')('npm')['init-author-name'];

		if (!fullname) {
			reject();
			return;
		}

		resolve(fullname);
	});
}

function checkPasswd() {
	return passwdUser()
		.then(user => {
			if (!user.fullname) {
				throw new Error();
			}

			return user.fullname;
		});
}

function checkGit() {
	return execa.stdout('git', ['config', '--global', 'user.name'])
		.then(fullname => fullname || Promise.reject());
}

function checkOsaScript() {
	return execa.stdout('osascript', ['-e', 'long user name of (system info)'])
		.then(fullname => fullname || Promise.reject());
}

function checkWmic() {
	return execa.stdout('wmic', ['useraccount', 'where', 'name="%username%"', 'get', 'fullname'])
		.then(stdout => {
			const fullname = stdout.replace('FullName', '');

			if (!fullname) {
				throw new Error();
			}

			return fullname;
		});
}

function checkGetEnt() {
	return execa.shell('getent passwd $(whoami)').then(res => {
		const fullname = (res.stdout.split(':')[4] || '').replace(/,.*/, '');
		if (!fullname) {
			throw new Error();
		}

		return fullname;
	});
}

function fallback() {
	if (process.platform === 'darwin') {
		return pAny([checkPasswd(), checkOsaScript()]);
	}

	if (process.platform === 'win32') {
		// Fullname is usually not set by default in the system on Windows 7+
		return pAny([checkGit(), checkWmic()]);
	}

	return pAny([checkPasswd(), checkGetEnt(), checkGit()]);
}

function getFullName() {
	return checkEnv()
		.catch(checkAuthorName)
		.catch(fallback)
		.catch(() => {});
}

module.exports = mem(getFullName);
