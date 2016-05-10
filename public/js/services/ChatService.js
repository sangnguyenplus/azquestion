angular.module('ChatService', [])

.factory('Chat', ['$http', function($http) {
    return {
        get: function() {
            return $http.get('/api/chat/');
        },
        count: function(userRecive) {
            return $http.get('/api/chat/count/' + userRecive);
        },
        getList: function(userRecive) {
            return $http.get('/api/chat/list/' + userRecive);
        },
        updateStatus: function(userRecive) {
            return $http.get('/api/chat/update/' + userRecive);
        },
        create: function(msg) {
            return $http.post('/api/chat/create/', msg);
        },
        delete: function(id) {
            return $http.delete('/api/chat/detete/' + id);
        }
    };
}]);
