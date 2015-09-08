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
					dest: 'css',
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
		  	files: ['js/**/*.js', 'scss/**/*.scss'],
		  	tasks: ['sass', 'jshint', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['sass', 'jshint', 'uglify', 'watch']);
};