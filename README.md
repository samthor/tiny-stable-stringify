Sorted version of `JSON.stringify()` so you can get a consistent hash from stringified data.
Zero dependencies, ~450 bytes uncompressed.

Versus the leading brand:

💨 30% faster

🗜️ 98% smaller (20.2kb with deps vs 0.45k and no deps)

## Usage

Install with your favorite package manager.
The API is the same as `JSON.stringify`, and the library mostly wraps that.

```js
import { stringify } from 'tiny-stable-stringify';

const obj = { z: 1, a: 2 };

console.info(stringify(obj));

// output is: {"a":2,"z":1}
```

Supports nested objects, sorting all keys consistently.

Handles the upcoming [raw JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON) feature, but just returns these unchanged with no sorting applied.

## Notes

This package doesn't support custom sorting because we (ab)use JS' record type which [puts integers first](https://darrinholst.com/blog/2021/09/25/object-keys/).
But you don't care, you just want the keys to be sorted.

## Requirements

I'm sure this is very upsetting, but this library requires a JS engine that supports `WeakMap`, `Object.keys`, `Array.isArray`, and `JSON.stringify`.
