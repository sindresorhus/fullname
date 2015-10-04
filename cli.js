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

fullname().then(console.log);
