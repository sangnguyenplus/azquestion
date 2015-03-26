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
    // Vote Up
    socket.on('voteup',function(data)
    {
    	if($cookieStore.get('currentUser')._id == data.userReciveId)
    	{
    		flash.success=data.userSendName+" đã thích câu hỏi "+data.userTitle;
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
    // createAnswer
    socket.on('createAnswer',function(data)
    {
        var listAU=[];
        $http.get('api/findAnswers/'+data.userQuestionId)
        .success(function(listQA)
        {
            for(var i in listQA)
            {
                var item=listQA[i];
                if(listAU.indexOf(item.userId._id)==-1)
                    listAU.push(item.userId._id);
            }
            for(var i in listAU)
            {
                var item=listAU[i];
                if($cookieStore.get('currentUser')._id == item)
                {
                    flash.success=data.userSendName+" đã trả lời câu hỏi "+data.userTitle;
                }
            }
        });
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
    // Duyệt câu hỏi
    socket.on('approve',function(data)
    {
        if($cookieStore.get('currentUser')._id == data.userReciveId)
        {
            flash.success="Câu hỏi "+ data.userTitle +" đã được quản trị đăng!";
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
    // Favorite
    socket.on('Favorite',function(data)
    {
        if($cookieStore.get('currentUser')._id == data.userReciveId)
        {
            flash.success=data.userSendName+" đã theo dõi câu hỏi "+data.userTitle;
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
    // deleteQuestion
    socket.on('deleteQuestion',function(data)
    {
        if($cookieStore.get('currentUser')._id == data.userReciveId)
        {
            flash.success="Câu hỏi "+ data.userTitle +" đã bị quản trị xóa!";
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