module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// Lint all javascript files
		jshint: {
		  // define the files to lint
		  files: ['gruntfile.js', 'js/**/*.js'],
		  options: {
		    globals: {
		      jQuery: true,
		      console: true,
		      module: true,
		      angular: true
		    }
		  }
		},

		/* Compile SASS files */
		sass: {
            options: {
                style: 'expanded',
                sourcemap: 'auto'
            },
			dist: {
				files: [{
					expand: true,
					cwd: 'scss',
					src: ['build.scss'],
					dest: 'build/css',
					ext: '.css'
				}]
			}
		},

		// Uglify js file
		uglify: {
			js: {
				files: {
					'js/main.min.js': ['js/main.js %>']
				}
			}
		},

		// Watch
		watch: {
            js: {
                files: ['scss/**/*.scss'],
                tasks: ['sass']
            },
            css: {
                files: ['js/**/*.js'],
                tasks: ['browserify']
            }
		},


        browserify: {
            dev: {
                options: {
                    // Add source maps
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: [
                    'js/main.js',
                    'js/modules/**/*.js'
                ],
                dest: 'build/js/student.js'
            }
        }
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['sass', 'browserify', 'watch']);
};