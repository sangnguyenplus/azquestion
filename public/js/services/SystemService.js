angular.module('SystemService', [])

.factory('System', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('/api/system');
        },
        edit: function(systemData) {
            return $http.post('/api/system/about/edit', systemData);
        }
    };
}]);
