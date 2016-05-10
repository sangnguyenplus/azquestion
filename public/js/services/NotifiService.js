angular.module('NotifiService', [])

.factory('Notifi', ['$http', function($http) {
    return {
        create: function(msg) {
            return $http.post('/api/notifi/create/', msg);
        }
    };
}]);
