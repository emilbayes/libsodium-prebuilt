var load = require('node-gyp-build')
var path = require('path')

exports.prefix = path.resolve(load.path(__dirname), '..')
exports.include = path.resolve(exports.prefix, 'include')
exports.lib = path.resolve(exports.prefix, 'lib')
exports.win32lib = path.resolve(exports.prefix, 'libsodium.lib')
