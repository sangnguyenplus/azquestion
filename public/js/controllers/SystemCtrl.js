angular.module('SystemCtrl', [])

.controller('SystemController', ['$scope', '$rootScope', '$cookieStore', '$state', '$http', 'flash', '$modal', 'appAlert', 'System', function($scope, $rootScope, $cookieStore, $state, $http, flash, $modal, appAlert, System) {
    $scope.loading = true;
    System.get()
        .success(function(data) {
            $scope.systemData = data;
            $scope.loading = false;
        });

    $scope.editSystemSetting = function() {
        if (!$.isEmptyObject($scope.systemData)) {
            System.edit($scope.systemData)
                .success(function(data) {
                    $scope.Proccess = false;
                    flash.success = 'Cập nhật thành công!';
                    $state.go('system-setting');
                });
        } else {
            flash.error = 'Bạn phải điền đầy đủ nội dung.';
            $scope.Proccess = false;
        }
    };
}]);
