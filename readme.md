# fullname

> Get the full name of the current user

Works on macOS, Linux, and Windows.

## Install

```sh
npm install fullname
```

## Usage

```js
import fullName from 'fullname';

console.log(await fullName());
//=> 'Sindre Sorhus'
```

In the rare case a name cannot be found, you could fall back to [`username`](https://github.com/sindresorhus/username).

## Related

- [fullname-cli](https://github.com/sindresorhus/fullname-cli) - CLI for this package
- [fullname-native](https://github.com/sindresorhus/fullname-native) - Native version of this package
- [username](https://github.com/sindresorhus/username) - Get the username of the current user
