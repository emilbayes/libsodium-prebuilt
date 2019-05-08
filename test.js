require('.') // can we load the native dep

var paths = require('./paths')

if (paths.prefix == null) throw new Error('Missing .prefix')
if (paths.include == null) throw new Error('Missing .include')
if (paths.lib == null) throw new Error('Missing .lib')
if (paths.win32lib == null) throw new Error('Missing .win32lib')
if (paths.win32dll == null) throw new Error('Missing .win32dll')
