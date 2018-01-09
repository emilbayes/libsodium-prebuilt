var os = require('os')
var fs = require('fs')
var path = require('path')
var proc = require('child_process')
var ini = require('ini')
var fse = require('fs-extra')

var release = path.join(__dirname, 'build/Release')
var debug = path.join(__dirname, 'build/Debug')
var artifactsDir = path.join(__dirname, 'libsodium.build')
var buildDir = fs.existsSync(release) ? release : debug
var arch = process.env.ARCH || os.arch()

switch (os.platform()) {
  case 'win32':
    buildWindows()
    break

  case 'darwin':
    buildDarwin()
    break

  case 'freebsd':
  case 'openbsd':
  default:
    buildUnix()
    break
}

function buildWindows () {
  var lib = path.join(artifactsDir, 'lib/libsodium-' + arch + '.dll')
  var dst = path.join(buildDir, 'libsodium.dll')

  copy(lib, dst, function (err) {
    if (err) throw err
  })
}

function buildUnix () {
  var lib = fs.realpathSync(path.join(__dirname, 'lib/libsodium-' + arch + '.so'))

  var la = ini.decode(fs.readFileSync(path.join(tmp, 'lib/libsodium.la')).toString())
  var dst = path.join(buildDir, la.dlname)

  copy(artifactsDir, buildDir, function (err) {
    if (err) throw err
  })
}

function buildDarwin () {
  var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
  var lib = path.join(buildDir, la.dlname)

  copy(artifactsDir, buildDir, function (err) {
    if (err) throw err
    proc.exec('install_name_tool -id "@loader_path/lib/libsodium.dylib" lib/libsodium.dylib', {cwd: buildDir}, function (err) {
      if (err) throw err
      proc.exec('install_name_tool -change "' + lib + '" "@loader_path/lib/libsodium.dylib" libsodium.node', {cwd: buildDir}, function (err) {
        if (err) throw err
      })
    })
  })
}

function copy (a, b, cb) {
  fse.copy(a, b, {
    preserveTimestamps: true,
    filter: function (path) {
      if (path.endsWith('lib')) return true
      if (path.endsWith('include')) return true
      if (path.endsWith('sodium')) return true
      if (path.endsWith('libsodium.build')) return true
      if (path.endsWith('.so')) return true
      if (path.endsWith('.h')) return true
      if (path.endsWith('.la')) return true

      return false
    }
  }, cb)
}
