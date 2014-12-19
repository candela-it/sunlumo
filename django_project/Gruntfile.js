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
                src: 'lib_css/ol.css',
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
                    'core/base_static/js/app.module.js': ['core/base_static/js/app.module.js']
                }
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            project: ['lib_js/lib/*.js'],
            tests: ['lib_js/tests/*.js']
        },
        watch: {
            project: {
                files: ['lib_js/lib/*.js', 'lib_css/*.css', 'lib_js/tests/*.js'],
                tasks: ['default', 'tests'],
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
            all: ['lib_js/tests/browser/*.html']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');

    grunt.registerTask('default', ['jshint:project', 'browserify:project']);
    grunt.registerTask('tests', ['jshint:tests', 'browserify:tests']);
    grunt.registerTask('build', ['browserify:project', 'cssmin', 'uglify']);
};