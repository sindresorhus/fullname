# fullname [![Build Status](https://travis-ci.org/sindresorhus/fullname.svg?branch=master)](https://travis-ci.org/sindresorhus/fullname)

> Get the fullname of the current user


## Install

```
$ npm install --save fullname
```

Tested on OS X, Linux and Windows.


## Usage

```js
const fullname = require('fullname');

fullname().then(name => {
	console.log(name);
	//=> 'Sindre Sorhus'
});
```

In the rare case a name can't be found you could fall back to [`username`](https://github.com/sindresorhus/username).


## CLI

```
$ npm install --global fullname
```

```
$ fullname --help

  Example
    $ fullname
    Sindre Sorhus
```


## Related

See [username](https://github.com/sindresorhus/username) to get the username of the current user.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
