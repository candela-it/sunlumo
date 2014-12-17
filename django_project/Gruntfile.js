module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        browserify: {
            js: {
                src: 'lib_js/app.js',
                dest: 'core/base_static/js/app.module.js'
            }
        },
        cssmin: {
            contrib: {
                src: 'lib_css/ol.css',
                dest: 'core/base_static/css/contrib.module.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-css');

    grunt.registerTask('build', ['browserify', 'cssmin']);
};