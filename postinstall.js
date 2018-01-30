var os = require('os')
var fs = require('fs')
var path = require('path')
var proc = require('child_process')
var ini = require('ini')
var fse = require('fs-extra')

var release = path.join(__dirname, 'build', 'Release')
var debug = path.join(__dirname, 'build', 'Debug')
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
  copy(artifactsDir, buildDir, function (err) {
    if (err) throw err
  })
}

function buildUnix () {
  copy(artifactsDir, buildDir, function (err) {
    if (err) throw err
  })
}

function buildDarwin () {
  var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
  var lib = path.join(la.libdir, la.dlname)
  var nativeNode = path.join(buildDir, 'libsodium-prebuilt.node')
  proc.exec('install_name_tool -id "@loader_path/lib/libsodium.dylib" lib/libsodium.dylib', {cwd: artifactsDir}, function (err) {
    if (err) throw err
    proc.exec(`install_name_tool -change "${lib}" "@loader_path/lib/libsodium.dylib" ${nativeNode}`, {cwd: artifactsDir}, function (err) {
      if (err) throw err

      copy(artifactsDir, buildDir, function (err) {
        if (err) throw err
      })
    })
  })
}

function copy (a, b, cb) {
  fse.copy(a, b, {
    filter: function (filePath) {
      if (filePath.endsWith(path.sep + 'lib')) return true
      if (filePath.endsWith(path.sep + 'include')) return true
      if (filePath.endsWith(path.sep + 'sodium')) return true
      if (filePath.endsWith(path.sep + 'libsodium.build')) return true
      if (/\.so(\.\d+)*/i.test(filePath)) return true
      if (filePath.endsWith('.h')) return true
      if (filePath.endsWith('.la')) return true
      if (filePath.endsWith('.dylib')) return true
      if (filePath.endsWith('.dll')) return true
      if (filePath.endsWith('.lib')) return true

      return false
    }
  }, cb)
}
