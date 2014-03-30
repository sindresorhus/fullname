# fullname [![Build Status](https://travis-ci.org/sindresorhus/fullname.svg?branch=master)](https://travis-ci.org/sindresorhus/fullname)

> Get the fullname of the current user


## Install

```bash
$ npm install --save fullname
```

Tested on OS X, Linux and Windows.


## Usage

```js
var fullname = require('fullname');

fullname(function (err, name) {
	console.log(name);
	//=> Sindre Sorhus
});
```


## CLI

You can also use it as a CLI app by installing it globally:

```bash
$ npm install --global fullname
```

#### Usage

```bash
$ fullname --help

Usage
  $ fullname
  Sindre Sorhus
```


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
