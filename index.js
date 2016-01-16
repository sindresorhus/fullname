'use strict';
const npmconf = require('npmconf');
const pify = require('pify');
const execa = require('execa');
const passwdUser = require('passwd-user');
let fullname;
let first = true;

module.exports = () => {
	if (!first) {
		return Promise.resolve(fullname);
	}

	first = false;

	if (fullname) {
		return Promise.resolve(fullname);
	}

	return pify(npmconf.load)().then(conf => {
		fullname = conf.get('init.author.name');

		if (!fullname) {
			return fallback().then(() => fullname);
		}

		return fullname;
	}).catch(fallback).then(() => fullname).catch(() => {});
};

function fallback() {
	if (process.platform === 'darwin') {
		return passwdUser(process.getuid())
			.then(user => fullname = user.fullname)
			.catch(() => {
				return execa('osascript', ['-e', '"long user name of (system info)"'])
					.then(res => fullname = res.stdout);
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
				return execa('wmic', ['useraccount', 'where', 'name="%username%"', 'get', 'fullname'])
					.then(res => fullname = res.stdout.replace('FullName', ''));
			});
	}

	return passwdUser(process.getuid())
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
			return execa('git', ['config', '--global', 'user.name'])
				.then(res => fullname = res.stdout);
		});
}
