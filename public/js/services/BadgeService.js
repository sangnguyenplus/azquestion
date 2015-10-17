angular.module('BadgeService', [])

.factory('Badge', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('/api/badge/');
        },
        create: function(formData) {
            return $http.post('/api/badge/create/', formData);
        },
        delete: function(id) {
            return $http.delete('/api/badge/detete/' + id);
        },
        edit: function(formData) {
            return $http.post('/api/badge/edit/', formData);
        }
    };
}]);
