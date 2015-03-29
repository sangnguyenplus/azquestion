angular.module('ChatCtrl',[])

.controller('ChatController',['$scope','$cookieStore','$window','$state', '$location','$http','$rootScope','appAlert','$modal','$modalStack','flash','AuthenticationService','socket', 'Chat',
  function($scope,$cookieStore,$window,$state, $location,$http,$rootScope,appAlert,$modal,$modalStack,flash,AuthenticationService,socket, Chat) {
/*    $scope.macros = {
    '0_o' : '![img](/images/icon/O_o.png)',
    ':((' : '![img](/images/icon/cry.png)',
    ':-D' : '![img](/images/icon/biggrin.png)',
    ':D' : '<img src="/images/icon/biggrin.png)" />',
    ':))' : '![img](/images/icon/roflmao.png)',
    ':))' : '![img](/images/icon/roflmao.png)',
    '=))' : '![img](/images/icon/roflmao.png)',
    ':)' : '![img](/images/icon/smile.png)',
    ':-)' : '![img](/images/icon/smile.png)',
    ':=)' : '<img src="/images/icon/smile.png)" />',
    };*/
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

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    // Initialize varibles
    var $window = $(window);
    var $messages = $('.chat-content'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $btnsendMessage =$('.chat-message-send-btn');

    // Prompt for setting a username
    var username;
    var _id;
    var avatar;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $inputMessage.focus();
    $inputMessage.focus(function(){
      if(!username){
        username= $cookieStore.get('currentUser').displayName;
        avatar= $cookieStore.get('currentUser').avatar;
        _id= $cookieStore.get('currentUser')._id;
        socket.emit('add user', {username: username, _id:_id, avatar: avatar});
      }
    });

    // Sends a chat message
    function sendMessage () {
      var message = $inputMessage.val();
      // Prevent markup from being injected into the message
      message = cleanInput(message);
      // if there is a non-empty message and a socket connection
      if (message && connected) {
        $inputMessage.val('');
        addChatMessage({
          username: username,
          avatar: avatar,
          message: message
        });
        // tell server to execute 'new message' and send along one parameter
        socket.emit('new message', {username: username, _id: _id, message: message});
          if(!$modalStack.getTop()){
            $http.get('/loggedin').success(function(user){
              if(user!=='0'){
                var modalInstance = $modal.open({
                  templateUrl: '/views/modal/chat.html',
                  controller: 'modal.chat',
                  backdrop: 'static',
                  resolve: {
                    userData: function () {
                       return {username: username, _id: _id, message: message};
                     }
                  }
                });
                modalInstance.result.then(function (dataFromOkModal) {
                  console.log(dataFromOkModal);
                }, function (dataFromDissmissModal) {
                  console.log(dataFromDissmissModal);
                });
                /*end modal*/
            }
          });
        }
        Chat.create($scope.formData);
      }
    }

    // Log a message
    function log (message, options) {
      var $el = $('<li>').addClass('log').text(message);
      addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage (data, options) {
      // Don't fade the message in if there is an 'X was typing'
      var $typingMessages = getTypingMessages(data);
      options = options || {};
      if ($typingMessages.length !== 0) {
        options.fade = false;
        $typingMessages.remove();
      }

      var $usernameDiv = '<img src="'+data.avatar+'" class="userAvatar" alt="'+data.username+'">';
      var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);
      if(data.typing){
        $messageBodyDiv.prepend('<i class="fa fa-pencil"></i> ');
        var $messageDiv = $('<li class="message"/>')
        .data('username', data.username)
        .addClass('typing')
        .append($usernameDiv,$messageBodyDiv);
      }
      else{
        var d = new Date();
        $messageBodyDiv.append('<p class="text-right"><i><small class="send_date">'+moment(d).fromNow()+'</small></i></p>');
        var $messageDiv = $('<li class="message"/>')
        .append($usernameDiv, $messageBodyDiv);
      }
      if(data.username==$cookieStore.get('currentUser').displayName){
        $messageDiv.addClass('sendUser');
      }

      addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping (data) {
      data.typing = true;
      data.message = 'đang gõ...';
      addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping (data) {
      getTypingMessages(data).fadeOut(function () {
        $(this).remove();
      });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement (el, options) {
      var $el = $(el);

      // Setup default options
      if (!options) {
        options = {};
      }
      if (typeof options.fade === 'undefined') {
        options.fade = true;
      }
      if (typeof options.prepend === 'undefined') {
        options.prepend = false;
      }

      // Apply options
      if (options.fade) {
        $el.hide().fadeIn(FADE_TIME);
      }
      if (options.prepend) {
        $messages.prepend($el);
      } else {
        $messages.append($el);
      }
      //$messages[0].scrollTop = $messages[0].scrollHeight;
    }

    // Prevents input from having injected markup
    function cleanInput (input) {
      return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping () {
      if (connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function () {
          var typingTimer = (new Date()).getTime();
          var timeDiff = typingTimer - lastTypingTime;
          if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing');
            typing = false;
          }
        }, TYPING_TIMER_LENGTH);
      }
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages (data) {
      return $('.typing.message').filter(function (i) {
        return $(this).data('username') === data.username;
      });
    }

    // Keyboard events

    $window.keydown(function (event) {
      // Auto-focus the current input when a key is typed
      if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
      }
      // When the client hits ENTER on their keyboard
      if (event.which === 13) {
          sendMessage();
          socket.emit('stop typing');
          typing = false;
      }
    });
    $('.chat-message-send-btn').click(function(){
          sendMessage();
          socket.emit('stop typing');
          typing = false;
    });

    $inputMessage.on('input', function() {
      updateTyping();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function () {
      $inputMessage.focus();
    });

    // Socket events

    // Whenever the server emits 'login', log the login message
    socket.on('usernames', function (data) {
      connected = true;
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      addChatMessage(data);
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      removeChatTyping(data);
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data);
    });
}]);