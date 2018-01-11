{
  'variables': {
    'target_arch%': '<!(node preinstall.js --print-arch)>'
  },
  'targets': [
    {
      'target_name': 'liblibsodium',
      'include_dirs' : [
        "<!(node -e \"require('nan')\")",
        'libsodium.build/include'
      ],
      'sources': [
        'binding.cc',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-g',
          '-O3'
        ]
      },
      'cflags': [
        '-g',
        '-O3'
      ],
      'libraries': [
        '<!(node preinstall.js --print-lib)'
      ],
      'conditions': [
        ['OS != "mac" and OS != "win"', {
          'link_settings': {
            'libraries': [ "-Wl,-rpath=\\$$ORIGIN/lib"]
          }
        }],
      ],
    }
  ]
}
