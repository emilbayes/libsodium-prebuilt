var load = require('node-gyp-build')
var path = require('path')

module.exports = load(__dirname)
module.exports.path = load.path(__dirname)
module.exports.include = path.resolve(__dirname, './libsodium.build/include')
