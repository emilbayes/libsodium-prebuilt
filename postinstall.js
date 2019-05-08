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
  // var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
  // var dylibPath = path.join(la.libdir, la.dlname)

  copy(artifactsDir, buildDir, function (err) {
    if (err) throw err
    renameSharedLib('so', function (err) {
      if (err) throw err
    })
  })
}

function buildDarwin () {
  var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
  var dylibPath = path.join(la.libdir, la.dlname)
  var libsodiumDylib = la.dlname
  var nodeSharedLib = path.join(buildDir, 'libsodium-prebuilt.node')

  proc.exec(`install_name_tool -id "@loader_path/lib/${libsodiumDylib}" lib/${libsodiumDylib}`, { cwd: artifactsDir }, function (err) {
    if (err) throw err
    proc.exec(`install_name_tool -change "${dylibPath}" "@loader_path/lib/${libsodiumDylib}" ${nodeSharedLib}`, { cwd: artifactsDir }, function (err) {
      if (err) throw err

      copy(artifactsDir, buildDir, function (err) {
        if (err) throw err
        renameSharedLib('dylib', function (err) {
          if (err) throw err
        })
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
      if (filePath.endsWith('.la')) return true
      if (filePath.endsWith('.h')) return true
      if (filePath.endsWith('.dylib')) return true
      if (filePath.endsWith('.dll')) return true
      if (filePath.endsWith('.lib')) return true

      return false
    }
  }, cb)
}

function renameSharedLib (ext, cb) {
  var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
  var dest = path.join(buildDir, 'lib', la.dlname)
  var src = fs.realpathSync(path.join(artifactsDir, 'lib/libsodium.' + ext))
  fse.copy(src, dest, cb)
}
