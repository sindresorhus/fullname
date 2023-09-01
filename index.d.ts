/**
Get the full name of the current user.

@example
```
import fullName from 'fullname';

console.log(await fullName());
//=> 'Sindre Sorhus'
```
*/
export default function fullName(): Promise<string | undefined>;
