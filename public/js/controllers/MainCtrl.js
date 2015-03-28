angular.module('MainCtrl',[])

.controller('MainController',['$scope','$cookieStore','$window','$state', '$location','$http','$rootScope','$modal','$modalStack','appAlert','flash','AuthenticationService','socket', function($scope,$cookieStore,$window,$state, $location,$http,$rootScope,$modal,$modalStack,appAlert,flash,AuthenticationService,socket) {
		$scope.$on('$viewContentLoaded', function ()
         {
	         /*Dùng cho nút ghi nhớ mật khẩu*/
	         $("a.your-remember").click(function(event) {
	                event.preventDefault();
	                if (!$(this).hasClass('clicked')) {
	                    $(this).addClass('clicked');
	                    $("input#remember").val(1);
	                } else {
	                    $(this).removeClass('clicked');
	                    $("input#remember").val(0);
	                }
	            });
	         /*Thiết lập thời gian tương đối*/
	         moment.locale('vi', {});
	    });
		$scope.fbLike="https://www.facebook.com/toiyeulaptrinhfanpage";
		/*Lấy đường dẫn hiện tại để tiến hành hightlight menu.*/
		 $scope.getClass = function (path) {
		 	if ($location.path().substr(0, $location.path().length) == path){
		 		if (path == "/" && $location.path() == "/")
		 			return "current-menu-item";
		 		else
		 			if (path == "/")
		 				return "";
		 			else
		 				return "current-menu-item";
		 		}
		 		else
		 			 return "";
		};
		/*Lấy thông tin đăng nhập nếu đăng nhập bằng mạng xã hội*/
		$http.get('/loggedin').success(function(data){
    		 if(data!=="0" && data.status==1){
    		 	$cookieStore.put('currentUser',data);
             	$rootScope.currentUser=$cookieStore.get('currentUser');
             	AuthenticationService.isLogged = true;
                $window.sessionStorage.token = data.token;
    		 }
    		 else{
    		 	$rootScope.currentUser=null;
    		 }
    	});
		$scope.showForm = function(type){
			$http.get('/loggedin').success(function(data){
	    		if(data!=='0'){
					$('.show-form.'+type).fadeIn(500);
				}
				else{
					flash.error='Bạn cần đăng nhập để thực hiện hành động này !';
				}
			});
		};
		socket.on('new answer', function(data){
			console.log('Câu trả lời mới được đăng!');
		});
		socket.on('new message', function(data){
			if(!$modalStack.getTop()){
            $http.get('/loggedin').success(function(user){
              if(user!=='0'){
                var modalInstance = $modal.open({
                  templateUrl: '/views/modal/chat.html',
                  controller: 'modal.chat',
                  backdrop: 'static',
                  resolve: {
                    userData: function () {
                       return data;
                     }
                  }
                });
                modalInstance.result.then(function (dataFromOkModal) {
                  console.log(dataFromOkModal);
                }, function (dataFromDissmissModal) {
                  console.log(dataFromDissmissModal);
                });
            }
          });
        }
		});
		socket.on('usernames', function(data){
			$http.get('/loggedin').success(function(user){
				if(user.displayName in data){
					$http.get('/api/user/online/'+user._id).success(function(data){
							console.log('Online');
						})
						.error(function(){
							console.log("error");
						});
				}
				else{
					if(user!=='0'){
						username= user.displayName;
				        avatar= user.avatar;
				        _id= user._id;
				        socket.emit('add user', {username: username, _id:_id, avatar: avatar});
					}
				}
	          });
			console.log(data);
		});
		socket.on('user left', function(data){
			$http.get('/api/user/offline/'+data._id).success(function(data){
					console.log('Offline');
				})
				.error(function(){
					console.log("error");
				});
		});


}])
.controller('SmileController',['$scope','$http', function($scope, $http) {
	$scope.people=[];
    $http.get('/api/people').success(function(data){
        angular.forEach(data, function(item){
            $scope.people.push({label: item.displayName});
        });
        console.log($scope.people);
    })
    .error(function(){
        console.log('error');
    });
    $scope.macros = {
    '0_o' : '![img](/images/icon/O_o.png)',
    ':((' : '![img](/images/icon/cry.png)',
    ':-D' : '![img](/images/icon/biggrin.png)',
    ':D' : '![img](/images/icon/biggrin.png)',
    ':))' : '![img](/images/icon/roflmao.png)',
    ':))' : '![img](/images/icon/roflmao.png)',
    '=))' : '![img](/images/icon/roflmao.png)',
    ':)' : '![img](/images/icon/smile.png)',
    ':-)' : '![img](/images/icon/smile.png)',
    ':=)' : '![img](/images/icon/smile.png)',
    };
}]);