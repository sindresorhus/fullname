import test from 'ava';
import fn from './';

test(async t => {
	const fullname = await fn();

	t.is(typeof fullname, 'string');
	t.true(fullname.length > 1);
});
