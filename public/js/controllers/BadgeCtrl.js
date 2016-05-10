angular.module('BadgeCtrl', [])

.controller('BadgeController', ['$scope', '$rootScope', '$cookieStore', '$state', '$http', 'flash', '$modal', 'appAlert', 'Badge', function($scope, $rootScope, $cookieStore, $state, $http, flash, $modal, appAlert, Badge) {
    $scope.loading = true;

    Badge.get()
        .success(function(data) {
            $scope.listBadge = data;
            $scope.loading = false;
        })
        .error(function() {
            console.log('error');
        });

    $scope.createBadge = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng nếu form rỗng thì không làm gì cả*/
        if (!$.isEmptyObject($scope.formData)) {
            /*gọi tới hàm create bên service*/
            Badge.create($scope.formData)
                /*nếu thêm mới thành công thì get lại dữ liệu mới*/
                .success(function(data) {
                    $scope.formData = {}; /* // Xóa form*/
                    $scope.form.$setPristine();
                    $scope.Proccess = false;
                    flash.success = 'Thêm mới thành công!';
                    $state.go('system-badge');
                })
                .error(function() {
                    flash.error = 'Danh hiệu này đã được sử dụng.';
                    $scope.Proccess = false;
                });
        } else {
            flash.error = 'Bạn cần điền đầy đủ các mục.';
            $scope.Proccess = false;
        }
    };

    $scope.deleteBadge = function(id) {
        appAlert.confirm({
            title: 'Xóa',
            message: 'Bạn chắc chắn muốn xóa danh hiệu này ?'
        }, function(isOk) {
            if (isOk) {
                Badge.delete(id)
                    /*Nếu xóa thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        $scope.listBadge = data;
                        flash.success = 'Xóa thành công!';
                    })
                    .error(function() {
                        flash.error = 'Có lỗi xảy ra. Xóa không thành công!';
                    });
            }
        });
    };
}])

.controller('BadgeDetail', ['$scope', '$http', '$state', '$stateParams', 'flash', 'Badge', function($scope, $http, $state, $stateParams, flash, Badge) {
    $http.get('api/badge/detail/' + $stateParams.id)
        .success(function(data) {
            $scope.formData = data;
        })
        .error(function() {
            console.log('error');
        });

    $scope.updateBadge = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng nếu form rỗng thì không làm gì cả*/
        if (!$.isEmptyObject($scope.formData)) {
            /*gọi tới hàm create bên service*/
            Badge.edit($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    $scope.form.$setPristine();
                    $scope.Proccess = false;
                    flash.success = 'Cập nhật thành công!';
                    $state.go('system-badge');

                })
                .error(function() {
                    flash.error = 'Danh hiệu này đã được sử dụng.';
                    $scope.Proccess = false;
                });
        } else {
            flash.error = 'Bạn cần điền đầy đủ các mục.';
            $scope.Proccess = false;
        }
    };
}]);
