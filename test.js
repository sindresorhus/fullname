import {serial as test} from 'ava';
import mem from 'mem';
import mock from 'mock-require';
import requireUncached from 'require-uncached';

let originalEnv;
let originalPlatform;
test.before(() => {
	originalEnv = Object.assign({}, process.env);
	originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
});

test.beforeEach(() => {
	delete process.env.GIT_AUTHOR_NAME;
	delete process.env.GIT_COMMITTER_NAME;
	delete process.env.HGUSER;
	delete process.env.C9_USER;

	Object.defineProperty(process, 'platform', originalPlatform);
	mock('rc', () => ({}));
});

test.after(() => {
	process.env = Object.assign({}, originalEnv);
	Object.defineProperty(process, 'platform', originalPlatform);
});

test('should get fullname from env var', async t => {
	const m = requireUncached('./');
	mem.clear(m);

	process.env.GIT_AUTHOR_NAME = 'TEST-ENV-FULL-NAME';
	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-ENV-FULL-NAME');
});

test('should get value from init-author-name', async t => {
	mock('rc', () => ({
		'init-author-name': 'TEST-INIT-AUTHOR-FULL-NAME'
	}));

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-INIT-AUTHOR-FULL-NAME');
});

test('should get value from passwdUser for darwin platform', async t => {
	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'darwin'
	});

	mock('passwd-user', () => Promise.resolve({
		fullname: 'TEST-PASSWD-FULL-NAME'
	}));

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-PASSWD-FULL-NAME');
});

test('should get value from osascript for darwin platform if passwdUser returns empty username', async t => {
	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'darwin'
	});

	mock('execa', {
		stdout: () => new Promise(resolve => resolve('TEST-OSASCRIPT-FULL-NAME'))
	});

	mock('passwd-user', () => new Promise(resolve => resolve()));

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-OSASCRIPT-FULL-NAME');
});

test('should get value from osascript for darwin platform if passwdUser rejects', async t => {
	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'darwin'
	});

	mock('execa', {
		stdout: () => new Promise(resolve => resolve('TEST-OSASCRIPT-FULL-NAME'))
	});

	mock('passwd-user', () => new Promise((resolve, reject) => reject()));

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-OSASCRIPT-FULL-NAME');
});

test('should get value from git global user for win32 platform', async t => {
	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'win32'
	});

	mock('execa', {
		stdout: first => {
			if (first === 'git') {
				return new Promise(resolve => resolve('TEST-GIT-GLOBAL-FULL-NAME'));
			}

			return new Promise(resolve => resolve(''));
		}
	});

	mock('passwd-user', () => new Promise((resolve, reject) => reject()));

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-GIT-GLOBAL-FULL-NAME');
});

test('should get value from wmic for win32 platform if git global returns empty username', async t => {
	mock('execa', {
		stdout: first => {
			if (first === 'wmic') {
				return new Promise(resolve => resolve('TEST-WMIC-FULL-NAME'));
			}

			return new Promise(resolve => resolve(''));
		}
	});

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'win32'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-WMIC-FULL-NAME');
});

test('should get value from wmic for win32 platform if git global rejects', async t => {
	mock('execa', {
		stdout: first => {
			if (first === 'wmic') {
				return new Promise(resolve => resolve('TEST-WMIC-FULL-NAME'));
			}

			return new Promise((resolve, reject) => reject('FAILED'));
		}
	});

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'win32'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-WMIC-FULL-NAME');
});

test('should get value from passwdUser for other platform and both other checks fail', async t => {
	mock('passwd-user', () => Promise.resolve({
		fullname: 'TEST-PASSWD-FULL-NAME'
	}));

	mock('execa', {
		stdout: () => new Promise((resolve, reject) => reject('FAILED')),
		// getent result
		shell: () => new Promise((resolve, reject) => reject('FAILED'))
	});

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-PASSWD-FULL-NAME');
});

test('should get value from getent for other platform and both other checks fail', async t => {
	mock('execa', {
		stdout: () => new Promise((resolve, reject) => reject('FAILED')),
		// getent result
		shell: () => new Promise(resolve => resolve({
			stdout: '1:2:3:4:TEST-GETENT-FULL-NAME'
		}))
	});

	mock('passwd-user', () => new Promise((resolve, reject) => reject('FAILED')));

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-GETENT-FULL-NAME');
});

test('should get value from git for other platform and both other checks fail', async t => {
	mock('execa', {
		stdout: () => new Promise(resolve => resolve('TEST-GIT-FULL-NAME')),
		// getent result
		shell: () => new Promise((resolve, reject) => reject('FAILED'))
	});
	mock('passwd-user', () => new Promise((resolve, reject) => reject('FAILED')));

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-GIT-FULL-NAME');
});

test('should get value from passwdUser for other platform and both other checks return empty string', async t => {
	mock('passwd-user', () => Promise.resolve({
		fullname: 'TEST-PASSWD-FULL-NAME'
	}));

	mock('execa', {
		// checkGit result
		stdout: () => new Promise(resolve => resolve('')),
		// getent result
		shell: () => new Promise(resolve => resolve(''))
	});

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-PASSWD-FULL-NAME');
});

test('should get value from getent for other platform and both other checks return empty string', async t => {
	mock('execa', {
		// checkGit result
		stdout: () => new Promise(resolve => resolve('')),
		// getent result
		shell: () => new Promise(resolve => resolve({
			stdout: '1:2:3:4:TEST-GETENT-FULL-NAME'
		}))
	});
	mock('passwd-user', () => new Promise(resolve => resolve('')));

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-GETENT-FULL-NAME');
});

test('should get value from git for other platform and both other checks return empty string', async t => {
	mock('execa', {
		// checkGit result
		stdout: () => new Promise(resolve => resolve('TEST-GIT-FULL-NAME')),
		// getent result
		shell: () => new Promise(resolve => resolve(''))
	});

	mock('passwd-user', () => new Promise(resolve => resolve('')));

	// redefine process.platform
	Object.defineProperty(process, 'platform', {
		value: 'other'
	});

	const m = requireUncached('./');
	mem.clear(m);

	const fullname = await m();

	t.is(typeof fullname, 'string');
	t.is(fullname, 'TEST-GIT-FULL-NAME');
});
