import {expectType} from 'tsd';
import fullName from './index.js';

expectType<Promise<string | undefined>>(fullName());
