angular.module('appModal', [])

.controller('modal.alert', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
    $scope.data = data;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}])

.controller('modal.confirm', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
    $scope.data = data;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}])

.controller('modal.report', ['$scope', '$modalInstance', 'data', function($scope, $modalInstance, data) {
    $scope.data = data;

    $scope.ok = function() {
        $modalInstance.close();
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}])

.controller('modal.uploadImage', ['$scope', '$modalInstance', '$upload', function($scope, $modalInstance, $upload) {
    $scope.uploadper = 0;
    $scope.showUpload = true;
    $scope.showAlert = false;

    /*modalInstance: Để gọi sự kiện ok và dissmiss...*/
    $scope.ok = function() {
        $modalInstance.close($scope.imgUrl); /*//tra ve url o controller dung model*/
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onFileSelect = function($files) {
        /*$files: an array of files selected, each file has name, size, and type.*/
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            if (file.size > 1200000) {
                $scope.showAlert = true;
            } else {
                $scope.showAlert = false;
                $scope.upload = $upload.upload({
                    url: 'api/user/upload/avatar',
                    method: 'POST',
                    withCredentials: true,
                    file: file,
                }).progress(function(evt) {
                    $scope.uploadper = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    /*file is uploaded successfully*/
                    $scope.imgUrl = data;
                    $scope.showUpload = false;
                });
            }
        }
    };
}])

.controller('modal.upload', ['$scope', '$modalInstance', '$upload', function($scope, $modalInstance, $upload) {
    $scope.uploadper = 0;
    $scope.showUpload = true;
    $scope.showAlert = false;

    /*modalInstance: Để gọi sự kiện ok và dissmiss...*/
    $scope.ok = function() {
        $modalInstance.close($scope.imgUrl); /*tra ve url o controller dung model*/
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onFileSelect = function($files) {
        /*$files: an array of files selected, each file has name, size, and type.*/
        for (var i = 0; i < $files.length; i++) {
            var file = $files[i];
            if (file.size > 1200000) {
                $scope.showAlert = true;
            } else {
                $scope.showAlert = false;
                $scope.upload = $upload.upload({
                    url: 'api/user/upload/',
                    method: 'POST',
                    withCredentials: true,
                    file: file,
                }).progress(function(evt) {
                    $scope.uploadper = parseInt(100.0 * evt.loaded / evt.total);
                }).success(function(data, status, headers, config) {
                    /*file is uploaded successfully*/
                    $scope.imgUrl = data;
                    $scope.showUpload = false;
                });
            }
        }
    };
}])

.controller('modal.chat', ['$scope', '$http', '$modalInstance', 'userData', function($scope, $http, $modalInstance, userData) {
    $scope.formData = {};
    $scope.user = userData;
    $scope.formData.userRecive = userData._id;

    $http.get('api/chat/' + userData._id)
        .success(function(data) {
            $scope.msg = data;
        })
        .error(function() {
            console.log('error');
        });

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}]);
