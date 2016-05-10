angular.module('MainCtrl', [])

.controller('MainController', ['$scope', '$cookieStore', '$window', '$state', '$location', '$http', '$rootScope', '$modal', '$modalStack', 'appAlert', 'flash', 'AuthenticationService', 'socket', function($scope, $cookieStore, $window, $state, $location, $http, $rootScope, $modal, $modalStack, appAlert, flash, AuthenticationService, socket) {
    $scope.$on('$viewContentLoaded', function() {
        /*Dùng cho nút ghi nhớ mật khẩu*/
        $('a.your-remember').click(function(event) {
            event.preventDefault();
            if (!$(this).hasClass('clicked')) {
                $(this).addClass('clicked');
                $('input#remember').val(1);
            } else {
                $(this).removeClass('clicked');
                $('input#remember').val(0);
            }
        });

        /*Thiết lập thời gian tương đối*/
        moment.locale('vi', {});
        $('.show-form').resizable({
            handles: 'n',
            animateDuration: 'fast',
            minHeight: 350,
            maxHeight: 555
        });
    });

    $scope.fbLike = 'https://www.facebook.com/toiyeulaptrinhfanpage';

    /*Lấy đường dẫn hiện tại để tiến hành hightlight menu.*/
    $scope.getClass = function(path) {
        if ($location.path().substr(0, $location.path().length) == path) {
            if (path == '/' && $location.path() == '/') {
                return 'current-menu-item';
            } else {
                if (path == '/') {
                    return '';
                } else {
                    return 'current-menu-item';
                }
            }
        } else {
            return '';
        }
    };

    /*Lấy thông tin đăng nhập nếu đăng nhập bằng mạng xã hội*/
    $http.get('/loggedin').success(function(data) {
        if (data !== '0' && data.status == 1) {
            $cookieStore.put('currentUser', data);
            $rootScope.currentUser = $cookieStore.get('currentUser');
            AuthenticationService.isLogged = true;
            $window.sessionStorage.token = data.token;
        } else {
            $rootScope.currentUser = null;
        }
    });

    $scope.showForm = function(type) {
        $http.get('/loggedin').success(function(data) {
            if (data !== '0') {
                $('.show-form.' + type).show();
                $('.show-form .createForm').show();
            } else {
                flash.error = 'Bạn cần đăng nhập để thực hiện hành động này !';
                $state.go('login');
            }
        });
    };

    $scope.chat = function(user) {
        $http.get('/loggedin').success(function(data) {
            if (data === '0') {
                flash.error = 'Bạn cần đăng nhập để thực hiện hành động này !';
            } else {
                /*begin modal*/
                var modalInstance = $modal.open({
                    templateUrl: '/views/modal/chat.html',
                    controller: 'modal.chat',
                    backdrop: 'static',
                    resolve: {
                        userData: function() {
                            return user;
                        }
                    }
                });

                modalInstance.result.then(function(dataFromOkModal) {
                    console.log(dataFromOkModal);
                }, function(dataFromDissmissModal) {
                    console.log(dataFromDissmissModal);
                });
            /*end modal*/
            }
        });
    };

    socket.on('new message', function(data) {
        if (!$modalStack.getTop()) {
            $http.get('/loggedin').success(function(user) {
                if (user !== '0') {
                    var modalInstance = $modal.open({
                        templateUrl: '/views/modal/chat.html',
                        controller: 'modal.chat',
                        backdrop: 'static',
                        resolve: {
                            userData: function() {
                                return data;
                            }
                        }
                    });

                    modalInstance.result.then(function(dataFromOkModal) {
                        console.log(dataFromOkModal);
                    }, function(dataFromDissmissModal) {
                        console.log(dataFromDissmissModal);
                    });
                }
            });
        }
    });

    socket.emit('reconnect');

    socket.on('new connection', function() {
        $http.get('/loggedin').success(function(user) {
            if (user !== '0') {
                socket.emit('add user', {
                    username: user.displayName,
                    _id: user._id,
                    avatar: user.avatar
                });
            }
        });
    });

    socket.on('logout', function(data) {
        $rootScope.listOnline = data;
        console.log($rootScope.listOnline);
    });

    socket.on('usernames', function(data) {
        $rootScope.listOnline = data;
        console.log($rootScope.listOnline);
    });

    socket.on('new question', function() {
        $http.get('/api/question')
            .success(function(data) {
                $rootScope.listQuestion = data;
                $http.get('api/questiontag/getall').success(function(data) {
                    $rootScope.listTag = data;
                })
                    .error(function() {
                        console.log('error');
                    });

                /*Phân trang*/
                $http.get('api/question/count').success(function(data) {
                    $rootScope.totalItems = data;
                });
                $rootScope.currentPage = 1;
                $rootScope.maxSize = 5;
                $rootScope.entryLimit = 10;
            /*Hết xử lý phân trang*/
            })
            .error(function() {
                console.log('Error');
            });
    });
}])

.controller('ReportController', ['$scope', '$http', function($scope, $http) {
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.entryLimit = 10;
    $http.get('api/report/getAll')
        .success(function(list) {
            $scope.listReport = list;
            console.log(list);
        })
        .error(function() {
            console.log('error');
        });
}]);
