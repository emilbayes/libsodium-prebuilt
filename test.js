require('.') // can we load the native dep

if (require('./include') == null) throw new Error('Missing .include')
