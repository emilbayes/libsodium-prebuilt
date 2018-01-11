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

```sh
node -p 'require("libsodium-prebuilt/include")'
```

## Contributing

```sh
git clone --recursive git://github.com/emilbayes/libsodium-prebuilt.git
```

## License

ISC
