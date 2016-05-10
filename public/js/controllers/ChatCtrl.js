angular.module('ChatCtrl', [])

.controller('ChatController', ['$scope', '$cookieStore', '$window', '$state', '$location', '$http', '$rootScope', 'appAlert', '$modal', '$modalStack', 'flash', 'AuthenticationService', 'socket', 'Chat', function($scope, $cookieStore, $window, $state, $location, $http, $rootScope, appAlert, $modal, $modalStack, flash, AuthenticationService, socket, Chat) {

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    // Initialize varibles
    var $window = $(window);
    var $messages = $('.chat-content'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $btnsendMessage = $('.chat-message-send-btn');

    // Prompt for setting a username
    var username,
        avatar,
        _id;

    $http.get('/loggedin').success(function(data) {
        if (data !== '0' && data.status == 1) {
            _id = data._id;
            username = data.displayName;
            avatar = data.avatar;
        }
    });
    var typing = false;
    var lastTypingTime;
    var $currentInput = $inputMessage.focus();

    // Sends a chat message
    function sendMessage() {
        var message = $inputMessage.val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message) {
            $inputMessage.val('');

            addChatMessage({
                username: username,
                message: message
            });

            // tell server to execute 'new message' and send along one parameter
            socket.emit('new message', {
                username: $('#userRecive').val(),
                message: message
            });
            if (!$modalStack.getTop()) {
                $http.get('/loggedin').success(function(user) {
                    if (user !== '0') {
                        var modalInstance = $modal.open({
                            templateUrl: '/views/modal/chat.html',
                            controller: 'modal.chat',
                            backdrop: 'static',
                            resolve: {
                                userData: function() {
                                    return {
                                        username: username,
                                        message: message
                                    };
                                }
                            }
                        });

                        modalInstance.result.then(function(dataFromOkModal) {
                            console.log(dataFromOkModal);
                        }, function(dataFromDissmissModal) {
                            console.log(dataFromDissmissModal);
                        });
                    /*end modal*/
                    }
                });
            }

            $scope.formData.status = 'false';
            for (var i = 0; i < $rootScope.listOnline.length; i++) {
                if ($rootScope.listOnline[i] == $('#userRecive').val()) {
                    $scope.formData.status = 'true';
                    break;
                }
            }
            Chat.create($scope.formData);
        }
    }

    // Log a message
    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    // Adds the visual chat message to the message list
    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = '<img src="' + data.avatar + '" class="userAvatar" alt="' + data.username + '">';
        if (data.username == username) {
            $usernameDiv = '<img src="' + avatar + '" class="userAvatar" alt="' + data.username + '">';
        }
        var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
        if (data.typing) {
            $messageBodyDiv.prepend('<i class="fa fa-pencil"></i> ');
            var $messageDiv = $('<li class="message"/>')
                .data('username', data.username)
                .addClass('typing')
                .append($usernameDiv, $messageBodyDiv);
        } else {
            var d = new Date();
            $messageBodyDiv.append('<p class="text-right"><i><small class="send_date">' + moment(d).fromNow() + '</small></i></p>');
            var $messageDiv = $('<li class="message"/>')
                .append($usernameDiv, $messageBodyDiv);
        }
        if (data.username == username) {
            $messageDiv.addClass('sendUser');
        }

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'đang gõ...';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }

    // Adds a message element to the messages and scrolls to the bottom
    // el - The element to add as a message
    // options.fade - If the element should fade-in (default = true)
    // options.prepend - If the element should prepend
    //   all other messages (default = false)
    function addMessageElement(el, options) {
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
    }

    // Prevents input from having injected markup
    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    // Updates the typing event
    function updateTyping() {
        if (!typing) {
            typing = true;
            socket.emit('typing', {
                username: $('#userRecive').val()
            });
        }
        lastTypingTime = (new Date()).getTime();

        setTimeout(function() {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                socket.emit('stop typing', {
                    username: $('#userRecive').val()
                });
                typing = false;
            }
        }, TYPING_TIMER_LENGTH);
    }

    // Gets the 'X is typing' messages of a user
    function getTypingMessages(data) {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.username;
        });
    }

    // Keyboard events

    $window.keydown(function(event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            sendMessage();
            socket.emit('stop typing', {
                username: $('#userRecive').val()
            });
            typing = false;
        }
    });

    $('.chat-message-send-btn').click(function() {
        sendMessage();
        socket.emit('stop typing', {
            username: $('#userRecive').val()
        });
        typing = false;
    });

    $inputMessage.on('input', function() {
        updateTyping();
    });

    // Focus input when clicking on the message input's border
    $inputMessage.click(function() {
        $inputMessage.focus();
    });


    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function(data) {
        if (data.username == $('#userRecive').val()) {
            addChatMessage(data);
        }
        getCount();
        getList();
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('logout', function(data) {
        if (data.username == $('#userRecive').val()) {
            removeChatTyping(data);
        }
    });

    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', function(data) {
        if (data.username == $('#userRecive').val()) {
            addChatTyping(data);
        }
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function(data) {
        if (data.username == $('#userRecive').val()) {
            removeChatTyping(data);
        }
    });

    function getCount() {
        if ($cookieStore.get('currentUser')) {
            Chat.count($cookieStore.get('currentUser')._id)
                .success(function(data) {
                    $scope.unread = data;
                })
                .error(function() {
                    console.log('Error');
                });
        }
    }
    ;

    function getList() {
        if ($cookieStore.get('currentUser')) {
            Chat.getList($cookieStore.get('currentUser')._id)
                .success(function(data) {
                    $rootScope.listChat = data;
                })
                .error(function() {
                    console.log('Error');
                });
        }
    }
    ;
    getCount();
    getList();

    $scope.updateCount = function() {
        Chat.updateStatus($cookieStore.get('currentUser')._id)
            .success(function() {
                getCount();
            })
            .error(function() {
                console.log('Error');
            });
    };
}]);
