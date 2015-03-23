angular.module('ChatService', [])

.factory('Chat',['$http', function($http) {
	return {
		get: function(){
			return $http.get('/api/chat/');
		},
		create : function(msg) {
			return $http.post('/api/chat/create/',msg);
		},
		delete : function(id) {
			return $http.delete('/api/chat/detete/' + id);
		},
		edit : function(formData) {
			return $http.post('/api/chat/edit/',formData);
		}
	};
}]);
