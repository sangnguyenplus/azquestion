angular.module('QuestionService', [])

.factory('Question', ['$http', function($http) {
    return {
        get: function(data) {
            return $http.get('/api/question');
        },
        create: function(formData) {
            return $http.post('/api/question/create', formData);
        },
        delete: function(id) {
            return $http.delete('/api/question/detete/' + id);
        },
        edit: function(formData) {
            return $http.post('/api/question/edit', formData);
        },
        approve: function(id) {
            return $http.get('/api/question/approve/' + id);
        },
        checkReport: function(id) {
            return $http.get('/api/question/report/' + id);
        },
        report: function(data) {
            return $http.post('/api/question/report/create', data);
        }
    };
}]);
