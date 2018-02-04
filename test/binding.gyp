{
    'variables': {
        'target_arch%': '<!(node -p "os.arch()")>'
    },
    'targets': [{
        'target_name': 'libsodium-prebuilt-test',
        'include_dirs+': [ # Avoid duplicate key by using the prepend option
          '<!(node -e "require(\'nan\')")',
        ],
        'sources': [
            'binding.cc'
        ],
        'xcode_settings': {
            'OTHER_CFLAGS': ['-g', '-O3']
        },
        'cflags': ['-g', '-O3'],


        # Below are the settings that you include in dependent projects (replacing .. with libsodium-prebuild)
        'include_dirs': [
            '<!(node -p "require(\'../paths\').include")'
        ],
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
                        '-l:<!(node -p \'require("../paths").soname\')',
                    ]
                }
            }]
        ],
    }]
}
