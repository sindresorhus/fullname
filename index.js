'use strict';
var exec = require('child_process').exec;
var fullname;
var first = true;

module.exports = function (cb) {
	if (!first) {
		return cb(null, fullname);
	}

	first = false;

	if (fullname) {
		return cb(null, fullname);
	}

	if (process.platform === 'darwin') {
		exec('osascript -e "long user name of (system info)"', function (err, stdout) {
			if (err) {
				return cb();
			}

			fullname = stdout.trim();

			cb(null, fullname);
		});
		return;
	}

	if (process.platform === 'win32') {
		exec('wmic useraccount where name="%username%" get fullname', function (err, stdout) {
			if (err) {
				return cb();
			}

			fullname = stdout.trim().replace(/^.*\r/, '');

			cb(null, fullname);
		});
		return;
	}

	exec('getent passwd $(whoami)', function (err, stdout) {
		fullname = stdout.trim().split(':')[4].replace(/,.*/, '');

		if (err || !fullname) {
			exec('git config --global user.name', function (err, stdout) {
				if (err) {
					return cb();
				}

				fullname = stdout.trim();

				cb(null, fullname);
			});
			return;
		}

		cb(null, fullname);
	});
};
