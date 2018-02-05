var load = require('node-gyp-build')
var path = require('path')
var ini = require('ini')
var fs = require('fs')
var version = require('./package.json').version

exports.prefix = path.resolve(load.path(__dirname), '..')
exports.include = path.resolve(exports.prefix, 'include')
exports.lib = path.resolve(exports.prefix, 'lib')

try {
  exports.soname = ini.decode(fs.readFileSync(path.join(exports.lib, 'libsodium.la'), 'utf8')).dlname
} catch (_) {}

exports.win32lib = path.resolve(exports.prefix, ['libsodium', version, 'lib'].join('.'))
exports.win32dll = path.resolve(exports.prefix, ['libsodium', version, 'dll'].join('.'))
