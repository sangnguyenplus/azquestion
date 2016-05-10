angular.module('AnswerService', [])

.factory('Answer', ['$http', '$stateParams', function($http, $stateParams) {
    return {
        get: function(data) {
            return $http.get('api/answer/get/' + $stateParams.question_id);
        },
        create: function(data) {
            return $http.post('/api/answer/create', data);
        },
        delete: function(id) {
            return $http.delete('/api/answer/detete/' + id);
        },
        report: function(id) {
            return $http.get('/api/answer/report/' + id);
        }
    };
}]);
