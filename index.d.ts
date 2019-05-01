/**
Get the full name of the current user.

@example
```
import fullName = require('fullname');

(async () => {
	console.log(await fullName());
	//=> 'Sindre Sorhus'
})();
```
*/
declare function fullName(): Promise<string | undefined>;

export = fullName;
