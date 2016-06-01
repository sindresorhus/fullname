import test from 'ava';
import m from './';

test(async t => {
	const fullname = await m();
	t.is(typeof fullname, 'string');
	t.true(fullname.length > 1);
});
