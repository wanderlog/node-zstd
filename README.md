# @skhaz/cppzst

[![][npm-version]][npm-url] [![][npm-downloads]][npm-url] [![license][license-img]][license-url] [![issues][issues-img]][issues-url] [![stars][stars-img]][stars-url] [![commits][commits-img]][commits-url]

Zstd binding for Nodejs, with TypeScript support.

## Installation

```sh
$ npm install @skhaz/cppzst --save
```

## Usage

### Async

#### compress(buffer[, zstdCompressParams])

```ts
import { compress } from "@skhaz/cppzst";

try {
  const output = await compress(input);
} catch (err) {
  // ...
}
```

#### decompress(buffer[, zstdDecompressParams])

```ts
import { decompress } from "@skhaz/cppzst";

try {
  const output = await decompress(input);
} catch (err) {
  // ...
}
```

### Sync

#### compressSync(buffer[, zstdCompressParams])

```ts
import { compressSync } from "@skhaz/cppzst";

try {
  const output = compressSync(input);
} catch (err) {
  // ...
}
```

#### decompressSync(buffer[, zstdCompressParams])

```ts
import { decompressSync } from "@skhaz/cppzst";

try {
  const output = decompressSync(input);
} catch (err) {
  // ...
}
```

### Stream

#### compressStream([zstdCompressParams])

```ts
import { compressStream } from "@skhaz/cppzst";
import { createReadStream, createWriteStream } from "fs";

createReadStream("path/to/input")
  .pipe(compressStream())
  .pipe(createWriteStream("path/to/output"));
```

#### decompressStream([zstdCompressParams])

```ts
import { decompressStream } from "@skhaz/cppzst";
import { createReadStream, createWriteStream } from "fs";

createReadStream("path/to/input")
  .pipe(decompressStream())
  .pipe(createWriteStream("path/to/output"));
```

### ZSTD Params

The `compress`, `compressSync` and `compressStream` methods may accept an optional `zstdCompressParams` object to define compress level and/or dict.

```ts
const zstdCompressParams = {
  level: 5, // default 1
  dict: new Buffer("hello zstd"), // if dict null, left level only.
  dictSize: dict.length, // if dict null, left level only.
};
```

The `decompress`, `decompressSync` and `decompressStream` methods may accept an optional `zstdDecompressParams` object to define dict.

```ts
const zdtdDecompressParams = {
  dict: new Buffer("hello zstd"),
  dictSize: dict.length,
};
```

## Tests

```sh
$ npm test
```

## License

MIT

[npm-version]: https://img.shields.io/npm/v/@skhaz/cppzst.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/@skhaz/cppzst.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/@skhaz/cppzst
[license-img]: https://img.shields.io/github/license/skhaz/cppzst?style=flat-square
[license-url]: LICENSE
[issues-img]: https://img.shields.io/github/issues/skhaz/cppzst?style=flat-square
[issues-url]: https://github.com/skhaz/cppzst/issues
[stars-img]: https://img.shields.io/github/stars/skhaz/cppzst?style=flat-square
[stars-url]: https://github.com/skhaz/cppzst/stargazers
[commits-img]: https://img.shields.io/github/last-commit/skhaz/cppzst?style=flat-square
[commits-url]: https://github.com/skhaz/cppzst/commits/master
