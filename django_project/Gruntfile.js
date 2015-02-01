module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            project: {
                src: 'lib_js/lib/app.js',
                dest: 'core/base_static/js/app.module.js'
            },
            tests: {
                src: [ 'lib_js/tests/browser/test_suite.js' ],
                dest: 'lib_js/tests/browser/test_suite.module.js',
                options: {
                    external: [ 'core/base_static/js/app.module.js' ],
                    // Embed source map for tests
                    debug: true
                }
            }
        },
        cssmin: {
            contrib: {
                src: ['lib_css/normalize.css', 'lib_css/foundation.css', 'lib_css/ol.css', 'lib_css/foundation-icons.css'],
                dest: 'core/base_static/css/contrib.module.css'
            },
            project: {
                src: 'lib_css/project.css',
                dest: 'core/base_static/css/project.module.css'
            }
        },
        uglify: {
            project: {
                files: {
                    'core/base_static/js/app.module.js': ['core/base_static/js/app.module.js'],
                    'core/base_static/js/vendor.module.js': ['core/base_static/js/vendor.module.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            project: [
                'lib_js/lib/*.js', 'lib_js/lib/ui/*.js', 'lib_js/lib/ui/views/*.js',
                'lib_js/lib/ui/models/*.js'
            ],
            tests: ['lib_js/tests/*.js']
        },
        watch: {
            project: {
                files: [
                    'lib_js/lib/*.js', 'lib_js/lib/ui/*.js', 'lib_js/lib/ui/views/*.js',
                    'lib_js/lib/ui/models/*.js', 'lib_css/*.css'
                ],
                tasks: ['default'],
                options: {
                    spawn: false,
                },
            },
            tests: {
                files: ['lib_js/lib/*.js', 'lib_css/*.css', 'lib_js/tests/*.js'],
                tasks: ['default', 'tests', 'mocha_phantomjs'],
                options: {
                    spawn: false,
                },
            }
        },
        mocha_phantomjs: {
            all: ['lib_js/tests/browser/*.html'],
            options: {
                reporter: 'list'
            }
        },
        mocha_istanbul: {
            coverage: {
                src: 'lib_js/tests',
                options: {
                    mask: '*.js'
                }
            },
        },
        istanbul_check_coverage: {
            default: {
                options: {
                    coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
                    check: {
                        lines: 80,
                        statements: 80
                    }
                }
            }
        }
    });

    grunt.event.on('coverage', function(lcov, done){
        console.log(lcov);
        done(); // or done(false); in case of error
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint:project', 'browserify:project', 'cssmin']);
    grunt.registerTask('tests', ['jshint:tests', 'browserify:tests']);
    grunt.registerTask('build', ['browserify:project', 'cssmin', 'uglify']);
};
