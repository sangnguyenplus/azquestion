angular.module('TagService', [])

.factory('Tag', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('/api/tag/');
        },
        create: function(formData) {
            return $http.post('/api/tag/create', formData);
        },
        delete: function(id) {
            return $http.delete('/api/tag/detete/' + id);
        },
        popularTag: function() {
            return $http.get('api/tag/popular-home');
        },
        edit: function(formData) {
            return $http.post('/api/tag/edit', formData);
        }
    };
}]);
