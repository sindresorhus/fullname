#!/usr/bin/env node
'use strict';
var meow = require('meow');
var fullname = require('./');

meow({
	help: [
		'Example',
		'  $ fullname',
		'  Sindre Sorhus'
	].join('\n')
});

fullname(function (err, name) {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}

	console.log(name);
});
