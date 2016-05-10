angular.module('TagCtrl', [])

.controller('TagController', ['$scope', '$cookieStore', '$http', '$location', '$rootScope', 'flash', '$modal', 'appAlert', 'Tag', function($scope, $cookieStore, $http, $location, $rootScope, flash, $modal, appAlert, Tag) {
    $http.get('api/tag/count')
        .success(function(data) {
            $scope.totalItems = data;
        });
    $scope.currentPage = 1; /*//current page*/
    $scope.maxSize = 5; /*//pagination max size*/
    $scope.entryLimit = 8; /*//max rows for data table*/
}])

.controller('ListTagController', ['$scope', 'Tag', 'socket', 'flash', 'appAlert', function($scope, Tag, socket, flash, appAlert) {
    /*Lấy toàn bộ tag*/
    $scope.loading = true;
    $scope.allTag = [];
    Tag.get()
        .success(function(data) {
            $scope.allTag = data;
            $scope.loading = false;
        })
        .error(function() {
            console.log('error');
        });

    /*Biến lưu trữ dữ liệu form*/
    $scope.formData = {};

    /*Khi form nhấn submit thì sẽ gửi giữ liệu tới api/tag*/
    $scope.createTag = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng nếu form rỗng thì không làm gì cả*/
        if (!$.isEmptyObject($scope.formData)) {
            /*gọi tới hàm create bên service*/
            Tag.create($scope.formData)
                /*nếu thêm mới thành công thì get lại dữ liệu mới*/
                .success(function(data) {
                    $scope.formData = {}; /*// Xóa form*/
                    $scope.form.$setPristine();
                    $scope.Proccess = false;
                    $('.add-tag-box').modal('hide');
                    flash.success = 'Thêm mới thành công!';
                    $scope.allTag = data;
                })
                .error(function() {
                    flash.error = 'Tag này đã được sử dụng.';
                    $scope.Proccess = false;
                });
            socket.emit('total tag');
        } else {
            flash.error = 'Bạn cần điền đầy đủ các mục.';
            $scope.Proccess = false;
        }
    };

    $scope.deleteTag = function(id) {
        appAlert.confirm({
            title: 'Xóa',
            message: 'Bạn chắc chắn muốn xóa tag này ?'
        }, function(isOk) {
            if (isOk) {
                Tag.delete(id)
                    /*Nếu xóa thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        $scope.allTag = data;
                        flash.success = 'Xóa thành công!';
                    });
                socket.emit('total tag');
            }
        });
    };
}])

.controller('PopularTagController', ['$scope', 'Tag', function($scope, Tag) {
    /*Lấy tag phổ biến*/
    $scope.popularTag = [];
    Tag.popularTag()
        .success(function(data) {
            $scope.popularTag = data;
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('getQuestionByTagController', ['$scope', '$stateParams', '$http', function($scope, $stateParams, $http) {
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.entryLimit = 10;
    var tag_id = $stateParams.id;
    $http.get('/api/getQuestionByTag/' + tag_id)
        .success(function(data) {
            $scope.listQuestion = data;
        })
        .error(function() {
            console.log('error');
        });
    $http.get('/api/tag/getTagById/' + tag_id)
        .success(function(data) {
            $scope.tag = data[0].tagName;
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('AutocompleteTagController', ['$scope', 'DataAccess', '$http', function($scope, DataAccess, $http) {
    /*Lấy danh sách tag hiện có, dùng cho autocomplete*/
    DataAccess.loadTag('tags');

    $scope.loadItems = function($query) {
        return DataAccess.searchTag('tags', $query);
    };
    var maxTags = 3;

    $scope.$watch('formData.tag.length', function(value) {
        if (value < maxTags) {
            $scope.placeholder = 'Thêm tối đa ' + (maxTags - value) + ' tags';
        } else {
            if (value > 0) {
                $scope.placeholder = 'Sửa tag';
            } else {
                $scope.placeholder = 'Thêm';
            }
        }
    });
}])

.controller('TagDetail', ['$scope', '$http', '$state', '$stateParams', 'flash', 'Tag', function($scope, $http, $state, $stateParams, flash, Tag) {
    $http.get('api/tag/detail/' + $stateParams.id)
        .success(function(data) {
            $scope.formData = data;
        })
        .error(function() {
            console.log('error');
        });

    $scope.updateTag = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng nếu form rỗng thì không làm gì cả*/
        if (!$.isEmptyObject($scope.formData)) {
            /*gọi tới hàm create bên service*/
            Tag.edit($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    $scope.form.$setPristine();
                    $scope.Proccess = false;
                    flash.success = 'Cập nhật thành công!';
                    $state.go('system-tag');
                })
                .error(function() {
                    flash.error = 'Tag này đã được sử dụng.';
                    $scope.Proccess = false;
                });
        } else {
            flash.error = 'Bạn cần điền đầy đủ các mục.';
            $scope.Proccess = false;
        }
    };
}])

.controller('CountTagController', ['$scope', '$rootScope', 'socket', '$http', 'Tag', function($scope, $rootScope, socket, $http, Tag) {
    /*Đếm số câu hỏi trong hệ thống*/
    $http.get('api/tag/count')
        .success(function(data) {
            $rootScope.countTag = data;
        })
        .error(function() {
            console.log('error');
        });
    socket.on('total tag', function() {
        $http.get('api/tag/count')
            .success(function(data) {
                $rootScope.countTag = data;
            })
            .error(function() {
                console.log('error');
            });
    });
}]);
