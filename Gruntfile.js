module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    
    concat: {
      options: {
        separator: '\n',
      },
      'x-tag-js': {
        src: [
          'components/document.register/src/document.register.js', 
          'components/x-tag-core/src/core.js'
        ],
        dest: 'demo/x-tag-components.js'
      
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
   
  grunt.registerTask('build', ['concat:x-tag-js']);
  
}