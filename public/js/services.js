angular.module('appServices', [])

.service('DataAccess', ['$http', '$q', function($http, $q) {
    var files = {};

    this.loadTag = function(name) {
        $http.get('/api/tag').success(function(data) {
            files[name] = data.map(function(item) {
                return item.tagName;
            });
        });
    };

    this.searchTag = function(name, query) {
        var items,
            deferred = $q.defer();

        items = _.chain(files[name])
            .filter(function(x) {
                return x.toLowerCase().indexOf(query.toLowerCase()) > -1;
            })
            .take(10)
            .value();

        deferred.resolve(items);
        return deferred.promise;
    };
}])

.service('appAlert', ['$modal', '$http', function($modal, $http) {
    this.alert = function(data, callback) {
        /*begin modal*/
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/alert.html',
            controller: 'modal.alert',
            backdrop: 'static',
            resolve: {
                data: function() {
                    return data;
                }
            }
        });

        modalInstance.result.then(function() {
            // do something
        }, function() {
            // do something
        });
    /*end modal*/
    };

    this.confirm = function(data, callback) {
        /*begin modal*/
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/confirm.html',
            controller: 'modal.confirm',
            backdrop: 'static',
            resolve: {
                data: function() {
                    return data;
                }
            }
        });

        modalInstance.result.then(function() {
            return callback(true);
        }, function() {
            return callback(false);
        });
        /*end modal*/
    };
    this.report = function(data, callback) {
        /*begin modal*/
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/report.html',
            controller: 'modal.report',
            backdrop: 'static',
            resolve: {
                data: function() {
                    return data;
                }
            }
        });

        modalInstance.result.then(function() {
            return callback(true);
        }, function() {
            return callback(false);
        });
        /*end modal*/
    };
}]);
