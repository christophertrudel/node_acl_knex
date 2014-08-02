'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);
	
	grunt.initConfig({
		jshint: {
			options: {
				bitwise: true,
				curly: true,
				forin: true,
				latedef: true,
				newcap: true,
				noarg: true,
				nonew: true,
				undef: true,
				unused: true,
				strict: true,
				trailing: true,
				quotmark: 'single',
				browser: true,
				smarttabs: true,
				node: true
			},
			app: {
				files: {
					src: ['Gruntfile.js', 'lib/**/*.js']
				}
			},
			test: {
				options: {
					globals: {
						describe: true,
						it: true,
						xit: true,
						xdescribe: true,
						before: true,
						beforeEach: true,
						after: true,
						afterEach: true,
						spyOn: true,
						expect: true
					}
				},
				files: {
					src: ['test/**/*.js']
				}
			}
		}
	});
	
	grunt.registerTask('default', ['jshint']);
};
