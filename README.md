# libsodium-prebuilt

[`libsodium`](https://github.com/jedisct1/libsodium) prebuilt as a shared library and NAN module.

```
npm install libsodium-prebuilts
```

[![build status](https://travis-ci.org/emilbayes/libsodium-prebuilt.svg?branch=master)](https://travis-ci.org/emilbayes/libsodium-prebuilt)
[![Build status](https://ci.appveyor.com/api/projects/status/g3xipfalgq6k9lrw/branch/master?svg=true)](https://ci.appveyor.com/project/emilbayes/libsodium-prebuilt/branch/master)

### :warning: This module does *not* follow semver, but `libsodium`s versioning scheme :warning:

## Usage

```js
require('libsodium-prebuild') // will load symbols
// Load your native module which depends on libsodium-prebuilt

```

Get platform resolved base path to compiled dependencies:

```sh
node -p 'require("libsodium-prebuilt/paths").include'
```

Get path to `include` directory, eg. for including headers:

```sh
node -p 'require("libsodium-prebuilt/paths").include'
```

Get path to `lib` directory, eg. for linking to `.dylib` or `.so` files:

```sh
node -p 'require("libsodium-prebuilt/paths").lib'
```

Get path to `libsodium.lib` file for linking on windows:

```sh
node -p 'require("libsodium-prebuilt/paths").win32lib'
```

## Contributing

```sh
git clone --recursive git://github.com/emilbayes/libsodium-prebuilt.git
```

## License

ISC
