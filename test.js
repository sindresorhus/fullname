import test from 'ava';
import fn from './';

test('should get the fullname of the current user', async t => {
	const fullname = await fn();

	t.true(typeof fullname === 'string');
	t.true(fullname.length > 1);
});