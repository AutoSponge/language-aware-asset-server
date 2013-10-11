module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
            options: {
                globals: {
                    require: true
                }
            }
        },
        nodeunit: {
            all: ["test/*_test.js"]
        },
        complexity: {
            generic: {
                src: ["src/**/*.js"],
                options: {
                    errorsOnly: false,
                    cyclomatic: 2,
                    halstead: 6,
                    maintainability: 145
                }
            }
        },
        docco: {
            debug: {
                src: ["src/**/*.js"],
                options: {
                    output: "docs/"
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-complexity");
    grunt.loadNpmTasks("grunt-docco");

    grunt.registerTask("test", ["jshint", "nodeunit", "complexity"]);

};