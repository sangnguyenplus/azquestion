angular.module('UserService', [])

.factory('User', ['$http', '$stateParams', function($http, $stateParams) {
    return {
        get: function() {
            return $http.get('/api/user');
        },
        login: function(userData) {
            return $http.post('/login', userData);
        },
        signup: function(userData) {
            return $http.post('/signup', userData);
        },
        logout: function() {
            return $http.get('/logout');
        },
        countUser: function() {
            return $http.get('api/countUser');
        },
        getUserDetail: function() {
            return $http.get('api/user/profile/' + $stateParams.id);
        },
        delete: function(id) {
            return $http.delete('/api/user/delete/' + id);
        },
        countQuestion: function() {
            return $http.get('api/user/count/question/' + $stateParams.id);
        },
        countAnswer: function() {
            return $http.get('api/user/count/answer/' + $stateParams.id);
        },
        activeAccount: function() {
            return $http.get('api/user/active/' + $stateParams.user_id + '/' + $stateParams.token);
        },
        getUserbyEmail: function(userData) {
            return $http.post('api/user/getUserbyEmail', userData);
        },
        edit: function(userData) {
            return $http.post('/api/user/edit', userData);
        },
        changePassword: function(userData) {
            return $http.post('/api/user/changePassword', userData);
        },
        resetPassword: function(userData) {
            return $http.post('/api/user/resetPassword', userData);
        },
        forgot: function(userData) {
            return $http.post('/forgot', userData);
        },
        updatePermission: function(userData) {
            return $http.post('/api/user/updatePermission', userData);
        }

    };
}])
.factory('AuthenticationService', function() {
    var auth = {
        isLogged: false
    };
    return auth;
})
.factory('TokenInterceptor', ['$q', '$window', '$location', 'AuthenticationService', function($q, $window, $location, AuthenticationService) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            }
            return config;
        },

        requestError: function(rejection) {
            return $q.reject(rejection);
        },

        /* Set Authentication.isAuthenticated to true if 200 received */
        response: function(response) {
            if (response !== null && response.status == 200 && $window.sessionStorage.token && !AuthenticationService.isAuthenticated) {
                AuthenticationService.isAuthenticated = true;
            }
            return response || $q.when(response);
        },

        /* Revoke client authentication if 401 is received */
        responseError: function(rejection) {
            if (rejection !== null && rejection.status === 401 && ($window.sessionStorage.token || AuthenticationService.isAuthenticated)) {
                delete $window.sessionStorage.token;
                AuthenticationService.isAuthenticated = false;
                $location.path("/login");
            }

            return $q.reject(rejection);
        }
    };
}]);
