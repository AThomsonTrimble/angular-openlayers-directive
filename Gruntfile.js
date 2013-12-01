module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            options: {
                stdout: true
            },
            selenium: {
                command: './selenium/start',
                options: {
                    stdout: false,
                    async: true
                }
            },
            protractor_install: {
                command: 'node ./node_modules/protractor/bin/install_selenium_standalone'
            },
            npm_install: {
                command: 'npm install'
            }
        },

        connect: {
            options: {
                base: 'examples/'
            },
            webserver: {
                options: {
                    port: 8888,
                    keepalive: true
                }
            },
            devserver: {
                options: {
                    port: 8888
                }
            },
            testserver: {
                options: {
                    port: 9999
                }
            },
            coverage: {
                options: {
                    base: 'coverage/',
                    directory: 'coverage/',
                    port: 5555,
                    keepalive: true
                }
            }
        },

        protractor: {
            options: {
                keepAlive: true,
                configFile: "test/protractor.conf.js"
            },
            singlerun: {},
            auto: {
                keepAlive: true,
                options: {
                    args: {
                        seleniumPort: 4444
                    }
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.no-header.js': ['dist/angular-openlayers-directive.ngmin.js']
                }
            }
        },

        ngmin: {
            directives: {
                expand: true,
                cwd: 'dist',
                src: ['angular-openlayers-directive.js'],
                dest: 'dist',
                ext: '.ngmin.js',
                flatten: 'src/'
            }
        },

        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: true,
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    angular: false,
                    OpenLayers: false,
                    L: false,
                    // Jasmine
                    jasmine    : false,
                    isCommonJS : false,
                    exports    : false,
                    spyOn      : false,
                    it         : false,
                    xit        : false,
                    expect     : false,
                    runs       : false,
                    waits      : false,
                    waitsFor   : false,
                    beforeEach : false,
                    afterEach  : false,
                    describe   : false,
                    xdescribe   : false,

                    // Protractor
                    protractor: false

                }
            },
            source: {
                src: ['src/directives/*.js', 'src/services/*.js']
            },
            tests: {
                //src: ['test/unit/*.js', 'test/e2e/*.js'],
                src: ['test/unit/*.js']
            },
            grunt: {
                src: ['Gruntfile.js']
            }
        },

        karma: {
            unit: {
                configFile: 'test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unit_auto: {
                configFile: 'test/karma-unit.conf.js',
                autoWatch: true,
                singleRun: false
            },
            unit_coverage: {
                configFile: 'test/karma-unit.conf.js',
                autoWatch: false,
                singleRun: true,
                //logLevel: 'DEBUG',
                reporters: ['progress', 'coverage'],
                preprocessors: {
                    'dist/angular-openlayers-directive.js': ['coverage']
                },
                coverageReporter: {
                    type : 'html',
                    dir : 'coverage/'
                }
            }
        },

        watch: {
            options : {
                livereload: 7777
            },
            source: {
                files: ['src/**/*.js'],
                tasks: [
                    'jshint',
                    'concat:dist',
                    'ngmin',
                    'uglify',
                    'test:unit',
                    //'test:e2e',
                    'concat:license'
                ]
            },
            protractor: {
                files: ['src/**/*.js','test/e2e/**/*.js'],
                tasks: ['protractor:auto']
            }
        },

        open: {
            devserver: {
                path: 'http://localhost:8888'
            },
            coverage: {
                path: 'http://localhost:5555'
            }
        },

        bower: {
            install: {
              //  options: {
              //      targetDir: './bower_components',
              //      cleanup: true
              //  }
            }
        },

        concat: {
            dist: {
                options: {
                    banner: '(function() {\n\n"use strict";\n\n',
                    footer: '\n}());'
                },
                src: [
                    'src/directives/openlayers.js',
                    //'src/directives/center.js',
                    //'src/directives/tiles.js',
                    //'src/directives/legend.js',
                    //'src/directives/geojson.js',
                    //'src/directives/layers.js',
                    //'src/directives/bounds.js',
                    //'src/directives/markers.js',
                    //'src/directives/paths.js',
                    //'src/directives/controls.js',
                    //'src/directives/eventBroadcast.js',
                    //'src/directives/maxBounds.js',
                    'src/services/*.js'
                ],
                dest: 'dist/angular-openlayers-directive.js',
            },
            license: {
                src: [
                    'src/header-MIT-license.txt',
                    'dist/angular-openlayers-directive.min.no-header.js'
                ],
                dest: 'dist/angular-openlayers-directive.min.js',
            },
        }
    });

    //single run tests
    grunt.registerTask('test', ['jshint','test:unit', 'test:e2e']);
    grunt.registerTask('test:unit', ['karma:unit']);
    grunt.registerTask('test:e2e', ['connect:testserver', 'protractor:singlerun']);

    //autotest and watch tests
    grunt.registerTask('autotest', ['karma:unit_auto']);
    grunt.registerTask('autotest:unit', ['karma:unit_auto']);
    grunt.registerTask('autotest:e2e', ['connect:testserver', 'shell:selenium', 'watch:protractor']);

    //coverage testing
    grunt.registerTask('test:coverage', ['karma:unit_coverage']);
    grunt.registerTask('coverage', ['karma:unit_coverage', 'open:coverage', 'connect:coverage']);

    //installation-related
    grunt.registerTask('install', ['shell:npm_install', 'bower:install', 'shell:protractor_install']);

    //defaults
    grunt.registerTask('default', ['watch:source']);

    //development
    grunt.registerTask('dev', ['connect:devserver', 'open:devserver', 'watch:source']);

    //server daemon
    grunt.registerTask('serve', ['connect:webserver']);

    //travis
    grunt.registerTask('travis', 'bower:install', 'test:unit');
};
