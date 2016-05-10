var app = angular.module('AZQuestion', [
    'ui.router',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTagsInput',
    'angular-flash.service',
    'angular-flash.flash-alert-directive',
    'ui.bootstrap',
    'restangular',
    'angularFileUpload',
    'ngProgress',
    'hc.marked',
    'ngAnimate',
    'btford.socket-io',
    'luegg.directives',
    'ngEmoticons',
    'ngMaterial',
    'ngMessages',
    'appRoutes',
    'appDirectives',
    'appFilters',
    'appServices',
    'appModal',
    'MainCtrl',
    'TagCtrl',
    'TagService',
    'BadgeCtrl',
    'BadgeService',
    'QuestionCtrl',
    'UserCtrl',
    'UserService',
    'QuestionCtrl',
    'QuestionService',
    'AnswerCtrl',
    'AnswerService',
    'SystemCtrl',
    'SystemService',
    'ChatCtrl',
    'ChatService',
    'NotifiCtrl',
    'NotifiService'
]);

app.config(['markedProvider', function(markedProvider) {
    markedProvider.setOptions({
        renderer: new marked.Renderer(),
        gfm: true,
        tables: true,
        breaks: true,
        pedantic: false,
        sanitize: true,
        smartLists: true,
        smartypants: false,
        highlight: function(code) {
            return hljs.highlightAuto(code).value;
        }
    });
}]);

app.config(['tagsInputConfigProvider', function(tagsInputConfigProvider) {
    tagsInputConfigProvider.setActiveInterpolation('tagsInput', {
        placeholder: true
    });
}]);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
}]);

/*Cấu hình thông báo lỗi*/
app.config(['flashProvider', function(flashProvider) {

    flashProvider.errorClassnames.push('alert-danger');
    flashProvider.warnClassnames.push('alert-warning');
    flashProvider.infoClassnames.push('alert-info');
    flashProvider.successClassnames.push('alert-success');

}]);

/*Cập nhật tiêu đề trang*/
app.run([
    '$log', '$rootScope', '$timeout', '$window', '$state', '$location', 'ngProgress', 'AuthenticationService', 'flash', function($log, $rootScope, $timeout, $window, $state, $location, ngProgress, AuthenticationService, flash) {

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.currentState = toState.name;
            $rootScope.currentParam = toParams;
            $rootScope.oldState = fromState.name;
            $rootScope.oldParam = fromParams;

            ngProgress.start();
            ngProgress.color('#d33');
            ngProgress.height('4px');

            if (toState.title) {
                $rootScope.pageTitle = toState.title + ' | Mạng xã hội hỏi đáp Việt Nam';
            } else {
                $rootScope.pageTitle = 'Mạng xã hội hỏi đáp Việt Nam';
            }
            /*Xác thực quyền thành viên khi truy cập vào trang cần đăng nhập*/
            if (toState.access.requiredLogin && !AuthenticationService.isLogged) {
                /*Nếu người dùng chưa đăng nhập*/
                flash.error = 'Bạn cần đăng nhập để truy cập vào khu vực này!';
                $state.transitionTo('login');
                event.preventDefault();
            }
        });

        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            /*Thực thi xử lý sau khi state thay đổi thành công*/
            ngProgress.complete();
            $timeout(function() {
                $window.scrollTo(45, 0);
            }, 500);
        });
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
            ngProgress.complete();
        });
    }]);

app.run([
    '$rootScope', function($rootScope) {
        $rootScope.facebookAppId = '762868437069360';
    }
]);

app.factory('socket', function(socketFactory) {
    return socketFactory();
});

app.config(function($mdIconProvider) {
    $mdIconProvider.icon('message', 'images/icons/message.svg', 24)
})

.run(function($http, $templateCache) {
    var urls = ['images/icons/message.svg'];
    angular.forEach(urls, function(url) {
        $http.get(url, {
            cache: $templateCache
        });
    });
});
