module.exports = function (grunt) {
    'use strict';
    // Project configuration
    grunt.initConfig({
        browserSync: {
            dev: {
                bsFiles: {
                    src: ['src/index.html', 'src/assets/js/*.js']
                },
                options: {
                    server: {
                        baseDir: 'src'
                    }
                }
            }
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-browser-sync');

    // Default task
    grunt.registerTask('serve', ['browserSync:dev']);
};

