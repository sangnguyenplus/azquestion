angular.module('NotifiCtrl', [])

.controller('NotifiController', ['$scope', '$cookieStore', '$window', '$state', '$location', '$http', '$rootScope', 'appAlert', 'flash', 'AuthenticationService', 'socket', 'Notifi', function($scope, $cookieStore, $window, $state, $location, $http, $rootScope, appAlert, flash, AuthenticationService, socket, Notifi) {

    $scope.updatecount = function() {
        $http.get('api/notifi/update')
            .success(function(data) {
                $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
                    .success(function(data) {
                        $scope.sfc = data;
                    });
            })
            .error(function() {
                console.log('error');
            });
    };

    // Xử lý Socket
    // Vote Up
    socket.on('voteup', function(data) {
        if ($cookieStore.get('currentUser')._id == data.userReciveId) {
            flash.success = '<a href="cau-hoi/chi-tiet/' + data.questionIds + '/' + '" >' + data.userSendName + ' đã thích câu hỏi ' + data.userTitle + '</a>';
        }

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // createAnswer
    socket.on('createAnswer', function(data) {
        if ($cookieStore.get('currentUser')._id == data.userReciveId) {
            flash.success = data.userSendName + ' đã trả lời câu hỏi ' + data.userTitle;
        }

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // reportQuestion
    socket.on('reportQuestion', function(data) {
        var listAD = [];

        $http.get('api/admin')
            .success(function(listAM) {
                for (var i in listAM) {
                    var item = listAM[i];
                    if (listAD.indexOf(item._id) == -1) {
                        listAD.push(item._id);
                    }
                }
                for (var i in listAD) {
                    var item = listAD[i];
                    if ($cookieStore.get('currentUser')._id == item) {
                        flash.success = '<a href="cau-hoi/chi-tiet/' + data.questionIds + '/">' + data.userSendName + ' báo cáo vi phạm câu hỏi ' + data.userTitle + '</a>';
                    }
                }
            });

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // Duyệt câu hỏi
    socket.on('approve', function(data) {
        if ($cookieStore.get('currentUser')._id == data.userReciveId) {
            flash.success = '<a href="cau-hoi/chi-tiet/' + data.questionIds + '/">Câu hỏi ' + data.userTitle + ' đã được quản trị đăng!</a>';
        }

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // Favorite
    socket.on('Favorite', function(data) {
        if ($cookieStore.get('currentUser')._id == data.userReciveId) {
            flash.success = '<a href="cau-hoi/chi-tiet/' + data.questionIds + '/">' + data.userSendName + ' đã theo dõi câu hỏi ' + data.userTitle + '</a>';
        }

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // deleteQuestion
    socket.on('deleteQuestion', function(data) {
        if ($cookieStore.get('currentUser')._id == data.userReciveId) {
            flash.error = 'Câu hỏi ' + data.userTitle + ' đã bị quản trị xóa!';
        }

        $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.listNotifi = data;
            });

        $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
            .success(function(data) {
                $scope.sfc = data;
            });
    });

    // Get Notification
    $http.get('api/notifi/detail/' + $cookieStore.get('currentUser')._id)
        .success(function(data) {
            $scope.listNotifi = data;
        });

    $http.get('api/notifi/count/' + $cookieStore.get('currentUser')._id)
        .success(function(data) {
            $scope.sfc = data;
        });
}]);
