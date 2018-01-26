#!/usr/bin/env node

var fs = require('fs')
var fse = require('fs-extra')
var os = require('os')
var proc = require('child_process')
var path = require('path')
var ini = require('ini')
var version = require('./package.json').version

var sourceDir = path.join(__dirname, 'libsodium')
var buildDir = path.join(__dirname, 'libsodium.build')
var arch = process.env.PREBUILD_ARCH || os.arch()

if (process.argv.indexOf('--arch') > -1) {
  arch = process.argv[process.argv.indexOf('--arch') + 1]
}

var warch = arch === 'x64' ? 'x64' : 'Win32'

if (process.argv.indexOf('--print-arch') > -1) {
  console.log(arch)
  process.exit(0)
}

if (process.argv.indexOf('--print-lib') > -1) {
  switch (os.platform()) {
    case 'darwin':
      console.log(path.join(buildDir, 'lib/libsodium.dylib'))
      break
    case 'openbsd':
    case 'freebsd':
    case 'linux':
      console.log(path.join(buildDir, 'lib/libsodium.so'))
      break
    case 'win32':
      console.log(path.join(buildDir, ['libsodium', version, 'lib'].join('.')))
      break
    default:
      process.exit(1)
  }

  process.exit(0)
}

switch (os.platform()) {
  case 'darwin':
    buildUnix('dylib', function (err) {
      if (err) throw err
    })
    break

  case 'win32':
    buildWindows()
    break

  default:
    buildUnix('so', function (err) {
      if (err) throw err
    })
    break
}

function buildWindows () {
  if (fs.existsSync(buildDir)) return

  spawn(path.join('.', 'msvc-scripts', 'process.bat'), [], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
    if (err) throw err
    var msbuild = path.resolve('/', 'Program Files (x86)', 'MSBuild', '14.0', 'Bin', 'MSBuild.exe')
    var args = ['/p:Configuration=ReleaseDLL;Platform=' + warch, '/nologo']
    spawn(msbuild, args, {cwd: sourceDir, stdio: 'inherit'}, function (err) {
      if (err) throw err

      fse.copy(path.join(sourceDir, 'src', 'libsodium', 'include'), path.join(buildDir, 'include'), function (err) {
        if (err) throw err

        var dll = path.join(sourceDir, 'Build', 'ReleaseDLL',  warch, 'libsodium.dll')

        var versionedDll = path.join(buildDir, ['libsodium', version, 'dll'].join('.'))
        spawn('rename-dll.cmd', [dll, versionedDll], {stdio: 'inherit'}, function (err) {
          if (err) throw err
        })
      })
    })
  })
}

function buildUnix (ext, cb) {
  if (fs.existsSync(buildDir)) return

  spawn('./configure', ['--prefix=' + buildDir], {cwd: __dirname, stdio: 'inherit'}, function (err) {
    if (err) throw err
    spawn('make', ['clean'], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
      if (err) throw err
      spawn('make', ['install'], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
        if (err) throw err

        strip(path.join(buildDir, 'lib/libsodium.' + ext), function (err) {
          if (err) throw err
        })
      })
    })
  })
}

function spawn (cmd, args, opts, cb) {
  var c = proc.spawn(cmd, args, opts)
  c.on('exit', function (code) {
    if (code) return cb(new Error(cmd + ' exited with ' + code))
    cb(null)
  })
}

function strip (file, cb) {
  var args = file.endsWith('.dylib') ? [file, '-Sx'] : [file, '--strip-all']
  var child = proc.spawn('strip', args, {stdio: 'ignore'})

  child.on('exit', function (code) {
    if (code) return cb(spawnError('strip', code))
    cb()
  })
}

function spawnError (name, code) {
  return new Error(name + ' exited with ' + code)
}
