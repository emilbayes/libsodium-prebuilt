#!/usr/bin/env node

var fs = require('fs')
var fse = require('fs-extra')
var os = require('os')
var proc = require('child_process')
var path = require('path')
var ini = require('ini')
var version = require('./package.json').version

var sourceDir = path.join(__dirname, 'libsodium')
var artifactsDir = path.join(__dirname, 'libsodium.build')
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
    case 'openbsd':
    case 'freebsd':
    case 'linux':
      var la = ini.decode(fs.readFileSync(path.join(artifactsDir, 'lib/libsodium.la')).toString())
      var dylibPath = path.join(la.libdir, la.dlname)
      console.log(dylibPath)
      break
    case 'win32':
      console.log(path.join(artifactsDir, ['libsodium', version, 'lib'].join('.')))
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
  if (fs.existsSync(artifactsDir)) return

  spawn(path.join('.', 'msvc-scripts', 'process.bat'), [], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
    if (err) throw err
    var msbuild = findMsBuild()
    var args = ['/p:Configuration=ReleaseDLL;Platform=' + warch, '/nologo']
    spawn(msbuild, args, {cwd: sourceDir, stdio: 'inherit'}, function (err) {
      if (err) throw err

      fse.copy(path.join(sourceDir, 'src', 'libsodium', 'include'), path.join(artifactsDir, 'include'), function (err) {
        if (err) throw err

        var dll = path.join(sourceDir, 'Build', 'ReleaseDLL',  warch, 'libsodium.dll')

        var versionedDll = path.join(artifactsDir, ['libsodium', version, 'dll'].join('.'))
        spawn('rename-dll.cmd', [dll, versionedDll, '--arch=' + arch], {stdio: 'inherit'}, function (err) {
          if (err) throw err
        })
      })
    })
  })
}

function buildUnix (ext, cb) {
  if (fs.existsSync(artifactsDir)) return

  spawn('./configure', ['--prefix=' + artifactsDir], {cwd: __dirname, stdio: 'inherit'}, function (err) {
    if (err) throw err
    spawn('make', ['clean'], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
      if (err) throw err
      spawn('make', ['install'], {cwd: sourceDir, stdio: 'inherit'}, function (err) {
        if (err) throw err

        strip(path.join(artifactsDir, 'lib/libsodium.' + ext), function (err) {
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

function findMsBuild () {
  var possiblePathSuffixes = [
    '/Microsoft Visual Studio/2017/BuildTools/MSBuild/15.0/Bin/msbuild.exe',
    '/Microsoft Visual Studio/2017/Enterprise/MSBuild/15.0/Bin/msbuild.exe',
    '/Microsoft Visual Studio/2017/Professional/MSBuild/15.0/Bin/msbuild.exe',
    '/Microsoft Visual Studio/2017/Community/MSBuild/15.0/Bin/msbuild.exe',
    '/MSBuild/14.0/Bin/MSBuild.exe',
    '/MSBuild/12.0/Bin/MSBuild.exe'
  ]

  // First try X86 paths (on 64 bit machine which is most likely) then 32 bit
  var possiblePaths = possiblePathSuffixes
    .map(p => process.env['PROGRAMFILES(X86)'] + p)
    .concat(possiblePathSuffixes.map(p => process.env['PROGRAMFILES'] + p))

  possiblePaths.push(process.env.WINDIR + '/Microsoft.NET/Framework/v4.0.30319/MSBuild.exe')

  for (var counter = 0; counter < possiblePaths.length; counter++) {
    var possiblePath = path.resolve(possiblePaths[counter])
    try {
      fs.accessSync(possiblePath)
      return possiblePath
    } catch (error) {
      // Binary not found checking next path
    }
  }

  console.error('MSBuild not found')
  console.error('You can run "npm install --global --production windows-build-tools" to fix this.')

  process.exit(1)
}
