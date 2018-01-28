var load = require('node-gyp-build')
var path = require('path')
var version = require('./package.json').version

exports.prefix = path.resolve(load.path(__dirname), '..')
exports.include = path.resolve(exports.prefix, 'include')
exports.lib = path.resolve(exports.prefix, 'lib')
exports.win32lib = path.resolve(exports.prefix, ['libsodium', version, 'lib'].join('.'))
exports.win32dll = path.resolve(exports.prefix, ['libsodium', version, 'dll'].join('.'))
