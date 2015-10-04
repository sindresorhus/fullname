#!/usr/bin/env node
'use strict';
var meow = require('meow');
var fullname = require('./');

meow({
	help: [
		'Example',
		'  $ fullname',
		'  Sindre Sorhus'
	]
});

fullname()
	.then(function (name) {
		console.log(name);
	}).catch(function (err) {
		console.error(err.message);
		process.exit(1);
	});
