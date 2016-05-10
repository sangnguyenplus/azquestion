angular.module('appRoutes', [])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
    /*Điều hướng 404*/
    $urlRouterProvider.otherwise('/404.html');
    $urlRouterProvider.when('/_=_', '/');

    /*Thiết lập các state*/
    $stateProvider

        /*===============QUESTIONS================*/
        .state('home', {
            url: '/',
            templateUrl: 'views/public/home.html',
            controller: 'ListQuestionController',
            access: {
                requiredLogin: false
            }
        })
        .state('about', {
            url: '/gioi-thieu.html',
            templateUrl: 'views/public/about.html',
            controller: 'SystemController',
            title: 'Giới thiệu',
            access: {
                requiredLogin: false
            }
        })
        .state('help', {
            url: '/huong-dan.html',
            templateUrl: 'views/public/help.html',
            controller: 'SystemController',
            title: 'Hướng dẫn',
            access: {
                requiredLogin: false
            }
        })
        .state('policy', {
            url: '/quy-dinh-va-noi-quy.html',
            templateUrl: 'views/public/policy.html',
            controller: 'SystemController',
            title: 'Quy định & Nội quy',
            access: {
                requiredLogin: false
            }
        })
        .state('question-detail', {
            url: '/cau-hoi/chi-tiet/:id/:slug',
            templateUrl: 'views/public/question/detail.html',
            controller: 'DetailQuestionController',
            title: 'Chi tiết câu hỏi',
            access: {
                requiredLogin: false
            }
        })
        .state('system-question', {
            url: '/system/questions',
            templateUrl: 'views/private/question/manage.html',
            controller: 'ListQuestionController',
            title: 'Quản lý câu hỏi',
            access: {
                requiredLogin: true
            }
        })
        .state('system-question-edit', {
            url: '/system/questions/edit/:id',
            templateUrl: 'views/private/question/edit.html',
            controller: 'QuestionController',
            title: 'Quản lý câu hỏi',
            access: {
                requiredLogin: true
            }
        })

        /*===============ANSWERS================*/
        .state('system-answer', {
            url: '/system/answers',
            templateUrl: 'views/private/answer/manage.html',
            controller: 'AnswerController',
            title: 'Quản lý câu trả lời',
            access: {
                requiredLogin: true
            }
        })
        .state('system-answer-detail', {
            url: '/system/answers/detail/:id',
            templateUrl: 'views/private/answer/detail.html',
            controller: 'AnswerController',
            title: 'Quản lý câu trả lời',
            access: {
                requiredLogin: true
            }
        })

        /*===============BADGES================*/
        .state('badges', {
            url: '/danh-hieu.html',
            templateUrl: 'views/public/badges.html',
            controller: 'BadgeController',
            title: 'Hệ thống danh hiệu',
            access: {
                requiredLogin: false
            }
        })
        .state('system-badge', {
            url: '/system/badges',
            templateUrl: 'views/private/badge/manage.html',
            controller: 'BadgeController',
            title: 'Quản lý danh hiệu',
            access: {
                requiredLogin: true
            }
        })
        .state('system-badge-add', {
            url: '/system/badges/add',
            templateUrl: 'views/private/badge/add.html',
            controller: 'BadgeController',
            title: 'Quản lý danh hiệu - Thêm mới',
            access: {
                requiredLogin: true
            }
        })
        .state('system-badge-edit', {
            url: '/system/badges/edit/:id',
            templateUrl: 'views/private/badge/edit.html',
            controller: 'BadgeController',
            title: 'Quản lý danh hiệu - Sửa',
            access: {
                requiredLogin: true
            }
        })

        /*===============USERS================*/
        .state('users', {
            url: '/thanh-vien.html',
            templateUrl: 'views/public/user/list.html',
            controller: 'ListUserController',
            title: 'Danh sách thành viên đã đăng ký',
            access: {
                requiredLogin: false
            }
        })
        .state('profile', {
            url: '/thong-tin-thanh-vien/:id/:slug',
            templateUrl: 'views/public/user/profile.html',
            controller: 'ProfileUserController',
            title: 'Chi tiết tài khoản',
            access: {
                requiredLogin: false
            }
        })
        .state('forgot_password', {
            url: '/thanh-vien/quen-mat-khau.html',
            templateUrl: 'views/public/user/resetpass.html',
            controller: 'UserController',
            title: 'Khôi phục mật khẩu',
            access: {
                requiredLogin: false
            }
        })
        .state('reset-password', {
            url: '/users/reset-password/:token',
            templateUrl: 'views/public/user/form-reset.html',
            controller: 'resetPasswordController',
            title: 'Khôi phục mật khẩu',
            access: {
                requiredLogin: false
            }
        })
        .state('edit-user', {
            url: '/chinh-sua-thong-tin/:id/:slug',
            templateUrl: 'views/public/user/edit.html',
            controller: 'EditProfile',
            title: 'Chỉnh sửa thông tin',
            access: {
                requiredLogin: true
            }
        })
        .state('register', {
            url: '/dang-ky.html',
            templateUrl: 'views/public/register.html',
            controller: 'UserController',
            title: 'Đăng ký thành viên',
            access: {
                requiredLogin: false
            }
        })
        .state('login', {
            url: '/dang-nhap.html',
            templateUrl: 'views/public/login.html',
            controller: 'UserController',
            title: 'Đăng nhập hệ thống',
            access: {
                requiredLogin: false
            }
        })
        .state('active_account', {
            url: '/users/active/:user_id/:token',
            templateUrl: 'views/public/notice.html',
            controller: 'UserController',
            title: 'Kích hoạt tài khoản',
            access: {
                requiredLogin: false
            }
        })
        .state('system-user', {
            url: '/system/users',
            templateUrl: 'views/private/user/manage.html',
            controller: 'ListUserController',
            title: 'Quản lý thành viên',
            access: {
                requiredLogin: true
            }
        })
        .state('system-user-permission', {
            url: '/system/users/permission/:id',
            templateUrl: 'views/private/user/permission.html',
            controller: 'EditProfile',
            title: 'Quản lý thành viên',
            access: {
                requiredLogin: true
            }
        })

        /*================SYSTEM================*/
        .state('system', {
            url: '/system',
            templateUrl: 'views/private/system.html',
            controller: 'MainController',
            title: 'Quản lý Hệ thống',
            access: {
                requiredLogin: true
            },
        /*isadmin:{requireAdmin: true}*/
        })

        /*===============TAGS================*/
        .state('tags', {
            url: '/tags.html',
            templateUrl: 'views/public/tag/index.html',
            controller: 'ListTagController',
            title: 'Tags',
            access: {
                requiredLogin: false
            }
        })
        .state('questions_tag', {
            url: '/cau-hoi-theo-tag/:id/:slug',
            templateUrl: 'views/public/tag/question.html',
            controller: 'getQuestionByTagController',
            title: 'Tagged Question',
            access: {
                requiredLogin: false
            }
        })
        .state('system-tag', {
            url: '/system/tags',
            templateUrl: 'views/private/tag/manage.html',
            controller: 'ListTagController',
            title: 'Quản lý Tags',
            access: {
                requiredLogin: true
            }
        })
        .state('system-tag-edit', {
            url: '/system/tags/edit/:id',
            templateUrl: 'views/private/tag/edit.html',
            controller: 'TagDetail',
            title: 'Quản lý Tags',
            access: {
                requiredLogin: true
            }
        })

        /*================SYSTEM SETTING==============*/
        .state('system-setting', {
            url: '/system/setting',
            templateUrl: 'views/private/setting/index.html',
            controller: 'SystemController',
            title: 'Cấu hình hệ thống',
            access: {
                requiredLogin: true
            }
        })
        .state('system-setting-about', {
            url: '/system/setting/about',
            templateUrl: 'views/private/setting/about.html',
            controller: 'SystemController',
            title: 'Chỉnh sửa giới thiệu',
            access: {
                requiredLogin: true
            }
        })
        .state('system-setting-policy', {
            url: '/system/setting/policy',
            templateUrl: 'views/private/setting/policy.html',
            controller: 'SystemController',
            title: 'Chỉnh sửa quy định & điều khoản',
            access: {
                requiredLogin: true
            }
        })
        .state('system-setting-help', {
            url: '/system/setting/help',
            templateUrl: 'views/private/setting/help.html',
            controller: 'SystemController',
            title: 'Chỉnh sửa hướng dẫn',
            access: {
                requiredLogin: true
            }
        })
        .state('system-report', {
            url: '/system/report',
            templateUrl: 'views/private/report/manage.html',
            controller: 'ReportController',
            title: 'Quản lý vi phạm',
            access: {
                requiredLogin: true
            }
        })

        /*===============404 NOT FOUND================*/
        .state('404', {
            url: '/404.html',
            templateUrl: 'views/public/404.html',
            title: '404 - Không tìm thấy trang yêu cầu',
            access: {
                requiredLogin: false
            }
        });

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
}]);
