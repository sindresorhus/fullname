'use strict';
var exec = require('child_process').exec;
var npmconf = require('npmconf');
var fullname;
var first = true;

module.exports = function (cb) {
	if (!first) {
		cb(null, fullname);
		return;
	}

	first = false;

	if (fullname) {
		cb(null, fullname);
		return;
	}

	npmconf.load(function (err, conf) {
		fullname = conf.get('init.author.name');

		if (err || !fullname) {
			fallback(cb);
			return;
		}

		cb(null, fullname);
	});
};

function fallback (cb) {
	if (process.platform === 'darwin') {
		exec('id -P', function (err, stdout) {
			fullname = stdout.trim().split(':')[7];

			// `id -P` should never fail as far as I know, but just in case:
			if (err || !fullname) {
				exec('osascript -e "long user name of (system info)"', function (err, stdout) {
					if (err) {
						cb();
						return;
					}

					fullname = stdout.trim();

					cb(null, fullname);
				});
				return;
			}

			cb(null, fullname);
		});

		return;
	}

	if (process.platform === 'win32') {
		// try git first since fullname is usually not set by default in the system on Windows 7+
		exec('git config --global user.name', function (err, stdout) {
			fullname = stdout.trim();

			if (err || !fullname) {
				exec('wmic useraccount where name="%username%" get fullname', function (err, stdout) {
					if (err) {
						cb();
						return;
					}

					fullname = stdout.replace('FullName', '').trim();

					cb(null, fullname);
				});
				return;
			}

			cb(null, fullname);
		});

		return;
	}

	exec('getent passwd $(whoami)', function (err, stdout) {
		if(stdout.trim().length != 0){
		   fullname = stdout.trim().split(':')[4].replace(/,.*/, '');
		   cb(null, fullname);
		} else {
		  exec("grep \"^`whoami`:\" /etc/passwd | awk -F: '{print $5}'", function(err,stdout){
		        fullname = stdout.trim().replace(/,.*/, '');
			fullname = fullname.replace(/(?:\r\n|\r|\n)/g, '');
			stdout.print(fullname);
			if (err || !fullname || fullname.length == 0) {
				exec('git config --global user.name', function (err, stdout) {
					if (err) {
						cb();
						return;
					}
	
					fullname = stdout.trim();
	
					cb(null, fullname);
					return;
				});
				return;
			}
			cb(null, fullname);
			return;
		   });
		}

	});
}
