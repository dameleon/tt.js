module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buster: {
            test: {
//                config: 'test/buster.js',
            },
            server: {
                port: 1111
            }
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '/** <%= pkg.title %> version:<%= pkg.version %> author:<%= pkg.author.name %> at:<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: 'src/*.js',
                dest: '<%= pkg.name %>.all.js'
            }
        },
        uglify: {
            options: {
                banner: '/** <%= pkg.title %> version:<%= pkg.version %> author:<%= pkg.author.name %> at:<%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: '<%= pkg.name %>.all.js',
                dest: '<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            all: 'src/*.js',
            options: {
                curly: true,
                eqnull: true,
                eqeqeq: true,
                undef: true,
                validthis: true,
                browser: true,
                globals: {
                    tt: true
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-buster');

    grunt.registerTask('test', ['jshint', 'buster']);
    grunt.registerTask('default', ['jshint', 'buster', 'concat', 'uglify']);
};
