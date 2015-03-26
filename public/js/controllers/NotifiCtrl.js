angular.module('NotifiCtrl',[])

.controller('NotifiController',['$scope','$cookieStore','$window','$state', '$location','$http','$rootScope','appAlert','flash','AuthenticationService','socket','Notifi',
  function($scope,$cookieStore,$window,$state, $location,$http,$rootScope,appAlert,flash,AuthenticationService,socket,Notifi) {

    $scope.updatecount=function()
    {
    	$http.get('api/notifi/update').success(function(data)
    	{
    		$http.get('api/notifi/count/'+$cookieStore.get('currentUser')._id)
            .success(function(data)
            {
                $scope.sfc=data;
            });
    	})
		.error(function()
		{
		  	console.log("error");
		});
    }
    // Xử lý Socket
    socket.on('voteup',function(data)
    {
    	if($cookieStore.get('currentUser')._id == data.userReciveId)
    	{
    		flash.success=data.userSendName+" đã thích câu hỏi này!";
    	}
    	$http.get('api/notifi/detail/'+$cookieStore.get('currentUser')._id)
    	.success(function(data)
    	{
    		$scope.listNotifi=data;
    	});
    	$http.get('api/notifi/count/'+$cookieStore.get('currentUser')._id)
	    .success(function(data)
	    {
	    	$scope.sfc=data;
	    });
    });
    // Get Notification
  	$http.get('api/notifi/detail/'+$cookieStore.get('currentUser')._id)
    .success(function(data)
    {
    	$scope.listNotifi=data;
    });
    $http.get('api/notifi/count/'+$cookieStore.get('currentUser')._id)
    .success(function(data)
    {
    	$scope.sfc=data;
    });
}]);