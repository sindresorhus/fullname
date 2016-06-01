'use strict';
const execa = require('execa');
const passwdUser = require('passwd-user');
let fullname;
let first = true;

function getEnvVar() {
	const env = process.env;

	return env.GIT_AUTHOR_NAME ||
		env.GIT_COMMITTER_NAME ||
		env.HGUSER || // Mercurial
		env.C9_USER; // Cloud9
}

module.exports = () => {
	if (!first) {
		return Promise.resolve(fullname);
	}

	first = false;

	if (fullname) {
		return Promise.resolve(fullname);
	}

	const envVar = getEnvVar();

	if (envVar) {
		fullname = envVar;
		return Promise.resolve(fullname);
	}

	return Promise.resolve().then(() => {
		fullname = require('rc')('npm')['init-author-name'];

		if (!fullname) {
			return fallback().then(() => fullname);
		}

		return fullname;
	}).catch(fallback).then(() => fullname).catch(() => {});
};

function fallback() {
	if (process.platform === 'darwin') {
		return passwdUser()
			.then(user => {
				fullname = user.fullname;
				return fullname;
			})
			.catch(() => {
				return execa.stdout('osascript', ['-e', 'long user name of (system info)']).then(stdout => {
					fullname = stdout;
					return fullname;
				});
			});
	}

	if (process.platform === 'win32') {
		// try git first since fullname is usually not set by default in the system on Windows 7+
		return execa('git', ['config', '--global', 'user.name'])
			.then(res => {
				fullname = res.stdout;

				if (!fullname) {
					throw new Error();
				}
			})
			.catch(() => {
				return execa.stdout('wmic', ['useraccount', 'where', 'name="%username%"', 'get', 'fullname'])
					.then(stdout => {
						fullname = stdout.replace('FullName', '');
						return fullname;
					});
			});
	}

	return passwdUser()
		.then(user => {
			fullname = user.fullname;

			if (!fullname) {
				throw new Error();
			}
		})
		.catch(() => {
			return execa.shell('getent passwd $(whoami)')
				.then(res => {
					fullname = (res.stdout.split(':')[4] || '').replace(/,.*/, '');

					if (!fullname) {
						throw new Error();
					}
				});
		})
		.catch(() => {
			return execa.stdout('git', ['config', '--global', 'user.name'])
				.then(stdout => {
					fullname = stdout;
					return fullname;
				});
		});
}
