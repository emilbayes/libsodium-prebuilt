{
    'variables': {
        'target_arch%': '<!(node -p "os.arch()")>'
    },
    'targets': [{
        'target_name': 'libsodium-prebuilt-test',
        'include_dirs': [
          '<!(node -e "require(\'nan\')")',
          '<!(node -p "require(\'../paths\').include")'
        ],
        'sources': [
            'binding.cc'
        ],
        'xcode_settings': {
            'OTHER_CFLAGS': ['-g', '-O3']
        },
        'cflags': ['-g', '-O3'],
        'conditions': [
            ['OS == "win"', {
                'link_settings': {
                    'libraries': [
                        '<!(node -p "require(\'../paths\').win32lib")',
                    ]
                },
                'msvs_settings': {
                    'VCLinkerTool': {
                        'DelayLoadDLLs': ['<!(node -p "require(\'../paths\').win32dll")']
                    }
                },
            }],
            ['OS == "mac"', {
              'link_settings': {
                  'libraries': [
                      '-L<!(node -p "require(\'../paths\').lib")',
                      '-lazy-lsodium',
                  ]
              }
            }],
            ['OS == "linux"', {
                'link_settings': {
                    'libraries': [
                        '-L<!(node -p \'require("../paths").lib\')',
                        '-z lazy',
                        '-lsodium',
                    ]
                }
            }]
        ],
    }]
}
