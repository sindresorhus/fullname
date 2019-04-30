import {expectType} from 'tsd';
import fullName = require('.');

expectType<Promise<string | undefined>>(fullName());
