angular.module('UserCtrl', [])

.controller('UserController', ['$scope', '$state', '$rootScope', '$cookieStore', '$window', '$http', '$location', '$stateParams', 'flash', '$modal', 'appAlert', 'User', 'AuthenticationService', 'socket', function($scope, $state, $rootScope, $cookieStore, $window, $http, $location, $stateParams, flash, $modal, appAlert, User, AuthenticationService, socket) {
    /*Biến lưu trữ dữ liệu form*/
    $scope.userData = {};
    $scope.login = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng*/
        if (!$.isEmptyObject($scope.userData)) {
            $rootScope.successMsg = '';

            User.getUserbyEmail($scope.userData)
                .success(function(u) {
                    if (u.length > 0) {
                        if (u[0].status === 0) {
                            flash.error = 'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email và kích hoạt tài khoản!';
                            $scope.Proccess = false;
                            $state.go('login');
                        } else {
                            User.login($scope.userData)
                                .success(function(data) {
                                    $cookieStore.put('currentUser', data);
                                    $rootScope.currentUser = $cookieStore.get('currentUser');
                                    AuthenticationService.isLogged = true;
                                    $window.sessionStorage.token = data.token;
                                    flash.success = 'Chào mừng ' + $cookieStore.get('currentUser').displayName + ' quay lại!';
                                    socket.emit('add user', {
                                        username: $cookieStore.get('currentUser').displayName,
                                        avatar: $cookieStore.get('currentUser').avatar,
                                        _id: $cookieStore.get('currentUser')._id
                                    });

                                    if ($rootScope.oldState !== '' && $rootScope.oldState !== 'active_account') {
                                        if ($rootScope.oldParam.id !== null) {
                                            $state.go($rootScope.oldState, {
                                                id: $rootScope.oldParam.id
                                            });
                                        } else {
                                            $state.go($rootScope.oldState);
                                        }
                                    } else {
                                        $state.go('home');
                                    }
                                })
                                .error(function() {
                                    flash.error = 'Email hoặc mật khẩu không chính xác.';
                                    $scope.Proccess = false;
                                    $state.go('login');
                                });
                        }
                    } else {
                        flash.error = 'Email hoặc mật khẩu không chính xác.';
                        $scope.Proccess = false;
                        $state.go('login');
                    }

                });
        }
    };

    $scope.signup = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng*/
        if (!$.isEmptyObject($scope.userData)) {
            User.signup($scope.userData)
                .success(function(data) {
                    flash.success = 'Đăng ký thành công. Hãy kiểm tra email của bạn để kích hoạt tài khoản!';
                    $state.go('home');
                })
                .error(function() {
                    flash.error = 'Email này đã được sử dụng, hãy chọn email khác.';
                    $scope.Proccess = false;
                    $state.go('register');
                });
        }
    };

    $scope.logout = function() {
        User.logout()
            .success(function() {
                $rootScope.currentUser = null;
                $cookieStore.remove('currentUser');
                if (AuthenticationService.isLogged) {
                    AuthenticationService.isLogged = false;
                    delete $window.sessionStorage.token;
                }
                flash.success = 'Đăng xuất thành công!';
                socket.emit('logout');
            });
    };

    $scope.deleteUser = function(id, path) {
        appAlert.confirm({
            title: 'Xóa',
            message: 'Bạn chắc chắn muốn xóa thành viên này ?'
        }, function(isOk) {
            if (isOk) {
                User.delete(id)
                    /*Nếu xóa thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        if (data.error_msg !== null) {
                            flash.error = data.error_msg;
                        } else {
                            flash.success = 'Xóa thành viên thành công!';
                            $scope.allUser = data;
                            $location.path(path);
                        }
                    });
            }
        });
    };

    $scope.resetPass = function() {
        $scope.Proccess = true;

        if (!$.isEmptyObject($scope.userData)) {
            User.forgot($scope.userData)
                .success(function(data) {
                    flash.success = 'Hệ thống đã gửi thông tin khôi phục tài khoản qua email của bạn, vui lòng kiểm tra email.';
                    $scope.Proccess = false;
                    $state.go('home');
                });
        }
    };
}])

.controller('ActiveAccount', ['$scope', '$state', 'User', function($scope, $state, User) {
    User.activeAccount()
        .success(function(data) {
            if (data.status == 1) {
                $scope.successMsg = true;
                $scope.Message = 'Kích hoạt tài khoản thành công! Hãy đăng nhập vào hệ thống để sử dụng các chức năng cho thành viên.';
            } else {
                $scope.successMsg = false;
                $scope.Message = 'Kích hoạt tài khoản không thành công. Mã token không hợp lệ!';
            }
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('ListUserController', ['$scope', 'User', 'Badge', '$mdDialog', function($scope, User, Badge, $mdDialog) {
    /*Lấy toàn bộ thành viên*/
    $scope.loading = true;
    $scope.allUser = [];
    $scope.listBadge = [];
    User.get()
        .success(function(data) {
            $scope.allUser = data;
        })
        .error(function() {
            console.log('error');
        });
    Badge.get()
        .success(function(badge) {
            $scope.listBadge = badge;
        })
        .error(function() {
            console.log('error');
        });
    $scope.loading = false;
}])

.controller('ProfileUserController', ['appAlert', 'flash', 'Restangular', '$modal', '$scope', '$rootScope', '$http', '$state', '$stateParams', 'User', 'Badge', function(appAlert, flash, Restangular, $modal, $scope, $rootScope, $http, $state, $stateParams, User, Badge) {
    /*Lấy thông tin của 1 thành viên có _id*/
    $scope.userInfo = [];
    User.getUserDetail()
        .success(function(data) {
            $scope.userInfo = data;
        })
        .error(function() {
            console.log('error');
        });

    Badge.get()
        .success(function(data) {
            $scope.listBadge = data;
        })
        .error(function() {
            console.log('error');
        });
    /*Đếm số câu hỏi mà thành viên này đã đăng*/
    User.countQuestion()
        .success(function(data) {
            $scope.numberQuestion = data;
        })
        .error(function() {
            console.log('error');
        });
    /*Đếm số câu trả lời*/
    User.countAnswer()
        .success(function(data) {
            $scope.numberAnswer = data;
        })
        .error(function() {
            console.log('error');
        });

    $http.get('api/question/getQuestionByUser/' + $stateParams.id)
        .success(function(data) {
            $scope.listQuestion = data;
        });

    $http.get('api/answer/getAnswerByUser/' + $stateParams.id)
        .success(function(data) {
            $scope.listAnswer = data;
        });
    $scope.currentPage = 1; /*//current page*/
    $scope.maxSize = 5; /*//pagination max size*/
    $scope.entryLimit = 5; /*//max rows for data table*/
}])

.controller('CountUserController', ['$scope', 'User', function($scope, User) {
    /*Đếm số thành viên trong hệ thống*/
    User.countUser()
        .success(function(data) {
            $scope.countUser = data;
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('EditProfile', ['appAlert', 'flash', 'Restangular', '$modal', '$scope', '$rootScope', '$http', '$state', 'User', function(appAlert, flash, Restangular, $modal, $scope, $rootScope, $http, $state, User) {

    User.getUserDetail()
        .success(function(data) {
            $scope.userAvatar = data.avatar;
            $scope.formData = data;
        })
        .error(function() {
            console.log('error');
        });

    $scope.uploadImage = function() {
        //begin modal
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/upload-image.html',
            controller: 'modal.uploadImage',
            resolve: {

            }
        });

        modalInstance.result.then(function(dataFromOkModal) {
            $scope.newAvatar = dataFromOkModal;
            $rootScope.currentUser.avatar = 'uploads/users/' + dataFromOkModal + '?' + Math.random() * 16 + new Date().getTime(); //Không cache url
            $http.get('api/user/edit/avatar/' + dataFromOkModal)
                .success(function(data) {
                    $scope.userAvatar = data.avatar;
                })
                .error(function() {
                    console.log('error');
                });
        }, function(dataFromDissmissModal) {
            console.log(dataFromDissmissModal);
        });
    /*end modal*/
    };
    $scope.updateUser = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng*/
        if (!$.isEmptyObject($scope.formData)) {
            User.edit($scope.formData)
                .success(function(data) {
                    $scope.formData = data;
                    flash.success = 'Cập nhật thông tin thành công!';
                    $scope.Proccess = false;
                })
                .error(function() {
                    flash.error = 'Có lỗi trong quá trình thay đổi thông tin.';
                    $scope.Proccess = false;
                });
        }
    };
    $scope.changePassword = function() {
        $scope.Proccess = true;
        if (!$.isEmptyObject($scope.formData)) {
            User.changePassword($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    flash.success = 'Đổi mật khẩu thành công!';
                    $scope.Proccess = false;
                })
                .error(function() {
                    flash.error = 'Mật khẩu hiện tại không chính xác, vui lòng kiểm tra lại!';
                    $scope.Proccess = false;
                });
        }
    };
    $scope.updatePermission = function() {
        $scope.Proccess = true;
        if (!$.isEmptyObject($scope.formData)) {
            User.updatePermission($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    flash.success = 'Cập nhật quyền hạn cho thành viên thành công!';
                    $scope.Proccess = false;
                    $state.go('system-user');
                })
                .error(function() {
                    flash.error = 'Có lỗi trong quá trình xử lý. Vui lòng thử lại sau!';
                    $scope.Proccess = false;
                });
        }
    };
}])

.controller('resetPasswordController', ['flash', '$window', '$scope', '$rootScope', '$http', '$state', '$stateParams', '$cookieStore', 'User', 'AuthenticationService', function(flash, $window, $scope, $rootScope, $http, $state, $stateParams, $cookieStore, User, AuthenticationService) {
    $scope.formData = {};
    $scope.formData.token = $stateParams.token;
    $scope.resetPassword = function() {
        $scope.Proccess = true;
        if (!$.isEmptyObject($scope.formData)) {
            User.resetPassword($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    $scope.Proccess = false;
                    if (data.error_msg !== null) {
                        flash.error = data.error_msg;
                    } else {
                        flash.success = 'Đổi mật khẩu thành công!';
                        $cookieStore.put('currentUser', data);
                        $rootScope.currentUser = $cookieStore.get('currentUser');
                        AuthenticationService.isLogged = true;
                        $window.sessionStorage.token = data.token;
                        $state.go('home');
                    }
                })
                .error(function() {
                    flash.error = 'Có lỗi trong quá trình xử lý yêu cầu. Vui lòng thực hiện lại vào thời điểm khác!';
                    $scope.Proccess = false;
                });
        }
    };
}]);
