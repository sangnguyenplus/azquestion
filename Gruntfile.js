module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                reporter: require('jshint-stylish') // sử dụng để tạo thông báo lỗi dễ đọc và đẹp hơn
            },

            //Các file sẽ kiểm tra khi chạy lệnh grunt jshint
            build: ['Grunfile.js', 'public/js/**/*.js', 'public/js/*.js']
        },

        // Cấu hình cho việc nén file JS
        uglify: {
            options: {
                banner: '/*\nSite Name: AZQuestion\nAuthor: Sang Nguyen\nAuthor URI: http://sangnguyen.info\nCreationDate:<%= grunt.template.today("yyyy-mm-dd") %>\nVersion: 1.0\n*/\n'
            },
            production: {
                files: {
                    'public/js/dist/controller.min.js': 'public/js/controllers/*.js',
                    'public/js/dist/service.min.js': 'public/js/services/*.js',
                    'public/js/dist/app.min.js': 'public/js/*.js',
                    'public/js/dist/library.min.js': ['public/libs/jquery/dist/jquery.min.js', 'public/libs/bootstrap/dist/js/bootstrap.min.js', 'public/libs/underscore/underscore-min.js', 'public/libs/jquery-waypoints/waypoints.min.js', 'public/libs/moment/min/moment-with-locales.js'],
                    'public/js/dist/dependencies.min.js': ['public/libs/angular/angular.min.js', 'public/libs/angular-ui-router/release/angular-ui-router.min.js', 'public/libs/angular-sanitize/angular-sanitize.min.js', 'public/libs/angular-cookies/angular-cookies.min.js',
                        'public/libs/angular-flash/dist/angular-flash.min.js', 'public/libs/ng-tags-input/ng-tags-input.min.js', 'public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js', 'public/libs/ng-file-upload/angular-file-upload.min.js', 'public/libs/ng-file-upload/angular-file-upload-shim.min.js',
                        'public/libs/restangular/dist/restangular.min.js', 'public/libs/ngprogress/build/ngProgress.min.js', 'public/libs/marked/lib/marked.js', 'public/libs/angular-marked/angular-marked.min.js',
                        'public/libs/highlightjs/highlight.pack.js', 'public/libs/angular-animate/angular-animate.min.js', 'public/libs/angular-resource/angular-resource.min.js']
                }
            }
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['app/**/*.js']
            }
        },

        env: {
            options: {
                //Shared Options Hash
            },
            dev: {
                NODE_ENV: 'development'
            },
            production: {
                NODE_ENV: 'production'
            },
            test: {
                NODE_ENV: 'test'
            }
        },

        nodemon: {
            dev: {
                script: 'server.js'
            }
        },

        //Cấu hình nén file CSS
        cssmin: {
            options: {
                banner: '/*\nSite Name: AZQuestion\nAuthor: Sang Nguyen\nAuthor URI: http://sangnguyen.info\nCreationDate:<%= grunt.template.today("yyyy-mm-dd") %>\nVersion: 1.0\n*/\n'
            },
            production: {
                files: {
                    'public/css/style.min.css': ['public/css/style.css', 'public/css/custom.css'],
                    'public/css/library.min.css': [
                        'public/libs/bootstrap/dist/css/bootstrap.min.css', 'public/libs/font-awesome/css/font-awesome.min.css',
                        'public/libs/ng-tags-input/ng-tags-input.min.css', 'public/libs/ng-tags-input/ng-tags-input.bootstrap.min.css',
                        'public/libs/ngprogress/ngProgress.css', 'public/libs/highlightjs/styles/github.css'
                    ]
                }
            }
        },
        watch: {

            // for stylesheets, watch css and less files
            // only run less and cssmin
            stylesheets: {
                files: ['public/css/src/*.css'],
                tasks: ['cssmin:dev']
            },

            // for scripts, run jshint and uglify
            scripts: {
                files: 'js/**/*.js',
                tasks: ['jshint', 'uglify']
            }
        },

        clean: ['node_modules', 'public/libs']
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // ===========================================================================
    // TẠO NHIỆM VỤ TƯƠNG ỨNG VỚI MÔI TRƯỜNG =====================================
    // ===========================================================================

    grunt.registerTask('serverTests', ['env:test', 'mochaTest']);
    grunt.registerTask('test', ['env:test', 'serverTests']);
    grunt.registerTask('dev', ['env:dev', 'nodemon']);
    grunt.registerTask('production', ['env:production', 'cssmin:production', 'uglify:production', 'nodemon']);

    // Nhiệm vụ mặc định, nó sẽ chạy tất cả các phần đã config
    grunt.registerTask('default', ['jshint', 'uglify', 'cssmin']);
};
