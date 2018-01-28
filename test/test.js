var mod = require('./index')

if (mod.randombytes_random() === mod.randombytes_random()) process.exit(1)
