var load = require('node-gyp-build')
var path = require('path')

module.exports = path.resolve(load.path(__dirname), '../include')
