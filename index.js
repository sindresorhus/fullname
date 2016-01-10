'use strict';
var npmconf = require('npmconf');
var pify = require('pify');
var Promise = require('pinkie-promise');
var execa = require('execa');
var passwdUser = require('passwd-user');
var fullname;
var first = true;

module.exports = function () {
	if (!first) {
		return Promise.resolve(fullname);
	}

	first = false;

	if (fullname) {
		return Promise.resolve(fullname);
	}

	return pify(npmconf.load, Promise)().then(function (conf) {
		fullname = conf.get('init.author.name');

		if (!fullname) {
			return fallback();
		}

		return fullname;
	}).catch(fallback).catch(function () {});
};

function fallback() {
	if (process.platform === 'darwin') {
		return passwdUser(process.getuid())
			.then(function (user) {
				return user.fullname;
			})
			.catch(function () {
				return execa('osascript', ['-e', '"long user name of (system info)"'])
					.then(function (res) {
						fullname = res.stdout;

						return fullname;
					});
			});
	}

	if (process.platform === 'win32') {
		// try git first since fullname is usually not set by default in the system on Windows 7+
		return execa('git', ['config', '--global', 'user.name'])
			.then(function (res) {
				fullname = res.stdout;

				if (!fullname) {
					throw new Error();
				}

				return fullname;
			})
			.catch(function () {
				return execa('wmic', ['useraccount', 'where', 'name="%username%"', 'get', 'fullname'])
					.then(function (res) {
						fullname = res.stdout.replace('FullName', '');

						return fullname;
					});
			});
	}

	return passwdUser(process.getuid())
		.then(function (user) {
			return user.fullname;
		})
		.catch(function () {
			return execa('getent', ['passwd', '$(whoami)'])
				.then(function (res) {
					fullname = (res.stdout.split(':')[4] || '').replace(/,.*/, '');

					if (!fullname) {
						throw new Error();
					}

					return fullname;
				});
		})
		.catch(function () {
			return execa('git', ['config', '--global', 'user.name'])
				.then(function (res) {
					fullname = res.stdout;

					return fullname;
				});
		});
}
