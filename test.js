'use strict';
var assert = require('assert');
var fullname = require('./index');

it('should get the fullname of the current user', function (cb) {
	fullname(function (err, name) {
		console.log('Fullname: %s', name);
		assert(typeof name === 'string');
		assert(name.length > 1);
		cb();
	});
});
