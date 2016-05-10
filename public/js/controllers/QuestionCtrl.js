angular.module('QuestionCtrl', [])

.controller('QuestionController', ['$timeout', '$scope', '$cookieStore', '$rootScope', '$location', '$state', '$http', '$q', '$stateParams', 'flash', '$modal', 'appAlert', 'Answer', 'Question', 'socket', 'Notifi', function($timeout, $scope, $cookieStore, $rootScope, $location, $state, $http, $q, $stateParams, flash, $modal, appAlert, Answer, Question, socket, Notifi) {
    $scope.formData = {};
    $scope.FullPath = $location.absUrl();

    $scope.showSuggest = function() {
        // Suggest Title
        listFinal = [];

        // Title
        $http.get('api/title/search/' + $scope.formData.title).success(function(ltitle) {
            for (var i = 0; i < ltitle.length; i++) {
                if (ltitle[i].isResolved == true) {
                    if (listFinal.indexOf(ltitle[i]) == -1) {
                        listFinal.push(ltitle[i]);
                    }
                }
            }
            for (var i = 0; i < ltitle.length; i++) {
                if (listFinal.indexOf(ltitle[i]) == -1) {
                    listFinal.push(ltitle[i]);
                }
            }

            $timeout(function() {
                $rootScope.suggestTag = $scope.formData.tag;
                $rootScope.suggestTitle = $scope.formData.title;
                $rootScope.suggestContent = $scope.formData.content;
                $rootScope.listSuggest = listFinal;
                $('.loading.suggest').fadeOut();
            }, 1000);

            if (listFinal.length != 0) {
                $('.createForm').hide();
                $('.loading.suggest').show();
            } else {
                $rootScope.suggestTag = $scope.formData.tag;
                $rootScope.suggestTitle = $scope.formData.title;
                $rootScope.suggestContent = $scope.formData.content;
                $scope.createQuestion();
            }
        });
    };

    // Toogle Content
    $scope.toogleContent = function() {
        if ($scope.formData.content == null) {
            $('.show-form').fadeOut(500);
        } else {
            if ($('.toogleContent i').hasClass('fa-chevron-down')) {
                $('.show-form').css({
                    'height': '40px',
                    'padding': '0'
                });

                $('.show-form .createForm').hide();
                $('.showContent').show();
                $('.ui-resizable-n').hide();
            } else {
                $('.show-form').css({
                    'height': '477px',
                    'padding': '30px 20px 20px'
                });
                $('.show-form .createForm').fadeIn(200);
                $('.showContent').hide();
                $('.ui-resizable-n').show();
            }
            $('.toogleContent i').toggleClass('fa-chevron-down');
            $('.toogleContent i').toggleClass('fa-chevron-up');
        }
    };

    /*Khi form nhấn submit thì sẽ gửi giữ liệu tới api/questions*/
    $scope.createQuestion = function() {
        $scope.Proccess = true;
        Question.create({
            title: $scope.suggestTitle,
            content: $scope.suggestContent,
            tag: $scope.suggestTag
        })
            .success(function(data) {
                $scope.form.$setPristine();
                $scope.Proccess = false;
                $('.show-form').fadeOut();
                if (!data.status) {
                    flash.success = 'Câu hỏi của bạn đã được gửi và đang chờ quản trị viên xét duyệt. Cám ơn bạn đã đăng bài.';
                    $state.go('home');
                } else {
                    flash.success = 'Đăng câu hỏi thành công!';
                    $location.path('/cau-hoi/chi-tiet/' + data._id + '/success');
                }
                socket.emit('new question');
            });

        $rootScope.suggestTag = null;
        $rootScope.suggestTitle = null;
        $rootScope.suggestContent = null;

        $scope.formData.title = null;
        $scope.formData.tag = null;
        $scope.formData.content = null;
    };

    $scope.upload = function() {
        /*begin modal*/
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/upload.html',
            controller: 'modal.upload',
            backdrop: 'static',
            resolve: {
            }
        });

        modalInstance.result.then(function(dataFromOkModal) {
            console.log(dataFromOkModal);
        }, function(dataFromDissmissModal) {
            console.log(dataFromDissmissModal);
        });
    /*end modal*/
    };

    $scope.deleteQuestion = function(id, path) {
        appAlert.confirm({
            title: 'Xóa',
            message: 'Bạn chắc chắn muốn xóa câu hỏi này ?'
        }, function(isOk) {
            if (isOk) {
                $http.get('api/question/detail/' + id)
                    .success(function(data) {
                        $http.get('api/admin').success(function(user) {
                            if (user.indexOf(data.userId._id) != -1) {
                                Notifi.create({
                                    userRecive: data.userId._id,
                                    userSend: $cookieStore.get('currentUser')._id,
                                    content: 'Câu hỏi ' + data.title + ' đã bị quản trị xóa!'
                                });
                                socket.emit('deleteQuestion', {
                                    userTitle: data.title,
                                    userReciveId: data.userId._id
                                });
                            }
                        });
                    })
                    .error(function() {
                        console.log('error');
                    });

                Question.delete(id)
                    /*Nếu xóa thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        socket.emit('new question');
                        flash.success = 'Xóa câu hỏi thành công!';
                        $scope.listQuestion = data;
                        $scope.listAdminQuestion = data;
                        $location.path(path);
                    });
            }
        });
    };

    $scope.approve = function(id) {
        appAlert.confirm({
            title: 'Xét duyệt',
            message: 'Bài viết đã duyệt sẽ được hiển thị ngay lập tức lên trang chủ, tiếp tục thao tác?'
        }, function(isOk) {
            if (isOk) {
                Question.approve(id)
                    /*Nếu duyệt thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        $http.get('api/question/detail/' + id)
                            .success(function(data) {
                                Notifi.create({
                                    userRecive: data.userId._id,
                                    userSend: $cookieStore.get('currentUser')._id,
                                    content: 'Câu hỏi ' + data.title + ' đã được quản trị đăng!',
                                    questionId: id
                                });
                                socket.emit('approve', {
                                    userTitle: data.title,
                                    userReciveId: data.userId._id,
                                    questionIds: id
                                });
                            })
                            .error(function() {
                                console.log('error');
                            });
                        flash.success = 'Đã duyệt thành công bài viết!';
                        $scope.listAdminQuestion = data;
                        $state.go('system-question');
                    });
            }
        });
    };

    $scope.closeForm = function() {
        appAlert.confirm({
            title: 'Xác nhận hủy',
            message: 'Bạn chắc chắn muốn hủy đăng câu hỏi này ?'
        }, function(isOk) {
            if (isOk) {
                $('.show-form').fadeOut(500);
                $rootScope.suggestTag = null;
                $rootScope.suggestTitle = null;
                $rootScope.suggestContent = null;

                $('.createForm').show();
                $scope.formData.title = null;
                $scope.formData.tag = null;
                $scope.formData.content = null;
            }
        });
    };

    $scope.listAllVote = [];
    $http.get('api/user/vote/all')
        .success(function(all) {
            $scope.listAllVote = all;
        })
        .error(function() {
            console.log('error');
        });

    $scope.listAllAnswer = [];
    $http.get('api/answer')
        .success(function(answer) {
            $scope.listAllAnswer = answer;
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('ListQuestionController', ['$scope', '$rootScope', '$http', 'flash', '$location', 'Question', function($scope, $rootScope, $http, flash, $location, Question) {
    $scope.loading = true;
    Question.get()
        .success(function(data) {
            $rootScope.listQuestion = data;
            $scope.loading = false;

            $http.get('api/questiontag/getall')
                .success(function(data) {
                    $scope.listTag = data;
                })
                .error(function() {
                    console.log('error');
                });

            /*Phân trang*/
            $http.get('api/question/count')
                .success(function(data) {
                    $rootScope.totalItems = data;
                });

            $rootScope.currentPage = 1;
            $rootScope.maxSize = 5;
            $rootScope.entryLimit = 10;
        /*Hết xử lý phân trang*/
        })
        .error(function() {
            console.log("Error");
        });

    $http.get('api/question/all')
        .success(function(data) {
            $scope.listAdminQuestion = data;
        });

}])

.controller('DetailQuestionController', ['$scope', '$rootScope', '$cookieStore', '$http', '$state', '$stateParams', '$location', 'flash', 'Question', 'Answer', '$modal', 'appAlert', 'socket', 'Notifi', function($scope, $rootScope, $cookieStore, $http, $state, $stateParams, $location, flash, Question, Answer, $modal, appAlert, socket, Notifi) {
    /*Chi tiết câu hỏi*/
    $scope.loading = true;
    $scope.formAnswer = {};
    var question_id = $stateParams.id;

    $http.get('api/question/detail/' + question_id)
        .success(function(data) {
            if (!data.status) {
                $state.go('404');
            }
            $scope.questionDetail = data;
            $scope.formAnswer.question_id = data._id;
            $scope.questionData = data;
            $scope.loading = false;
        })
        .error(function() {
            console.log("error");
        });

    $http.get('api/findAnswers/' + question_id)
        .success(function(data) {
            $scope.listAnswerQuestion = data;
        })
        .error(function() {
            console.log('error');
        });

    $http.get('api/answer/count/' + question_id)
        .success(function(data) {
            $scope.numberAnswer = data;
        })
        .error(function() {
            console.log('error');
        });

    $http.get('api/findTags/' + question_id)
        .success(function(data) {
            $scope.TagQuestion = data;
        })
        .error(function() {
            console.log('error');
        });

    $scope.createAnswer = function() {
        $scope.Proccess = true;
        /*Kiểm tra dữ liệu rỗng nếu form rỗng thì không làm gì cả*/
        if (!$.isEmptyObject($scope.formAnswer)) {
            // Notify answer
            $http.get('api/question/detail/' + $scope.formAnswer.question_id)
                .success(function(data) {
                    $http.get('api/findFavorite/' + $scope.formAnswer.question_id)
                        .success(function(listFA) {
                            for (var i in listFA) {
                                var item = listFA[i];
                                Notifi.create({
                                    userRecive: item.userId._id,
                                    userSend: $cookieStore.get('currentUser')._id,
                                    content: $cookieStore.get('currentUser').displayName + ' đã trả lời câu hỏi ' + data.title,
                                    questionId: item._id
                                });

                                socket.emit('createAnswer', {
                                    userSendName: $cookieStore.get('currentUser').displayName,
                                    userReciveId: item.userId._id,
                                    userTitle: data.title,
                                    userQuestionId: data._id
                                });
                            }

                            $http.get('api/findAnswers/' + $scope.formAnswer.question_id)
                                .success(function(listAN) {
                                    var listFANA = [];
                                    for (var j in listFA) {
                                        var item2 = listFA[j];
                                        listFANA.push(item2.userId._id);
                                    }

                                    var listNTF = [];

                                    for (var i in listAN) {
                                        var item = listAN[i];
                                        if (listNTF.indexOf(item.userId._id) == -1 && listFANA.indexOf(item.userId._id) == -1) {
                                            listNTF.push(item.userId._id);
                                        }
                                    }

                                    for (var i in listNTF) {
                                        var item = listNTF[i];
                                        if (item == data.userId._id && listNTF.length == 0) {

                                        } else {

                                            if ($cookieStore.get('currentUser')._id != data.userId._id) {
                                                Notifi.create({
                                                    userRecive: data.userId._id,
                                                    userSend: $cookieStore.get('currentUser')._id,
                                                    content: $cookieStore.get('currentUser').displayName + ' đã trả lời câu hỏi ' + data.title,
                                                    questionId: data._id
                                                });
                                                socket.emit('createAnswer', {
                                                    userSendName: $cookieStore.get('currentUser').displayName,
                                                    userReciveId: data.userId._id,
                                                    userTitle: data.title,
                                                    userQuestionId: data._id
                                                });
                                            } else {
                                                if ($cookieStore.get('currentUser')._id != item) {
                                                    Notifi.create({
                                                        userRecive: item,
                                                        userSend: $cookieStore.get('currentUser')._id,
                                                        content: $cookieStore.get('currentUser').displayName + ' đã trả lời câu hỏi ' + data.title,
                                                        questionId: data._id
                                                    });
                                                    socket.emit('createAnswer', {
                                                        userSendName: $cookieStore.get('currentUser').displayName,
                                                        userReciveId: item,
                                                        userTitle: data.title,
                                                        userQuestionId: data._id
                                                    });
                                                }

                                            }

                                        }
                                    }
                                });
                        });
                })
                .error(function() {
                    console.log("error");
                });

            // Create answer
            Answer.create($scope.formAnswer)
                .success(function(data) {
                    $scope.formAnswer.content = '';
                    $scope.Proccess = false;
                    $('.show-form').fadeOut();
                    flash.success = 'Gửi trả lời thành công!';
                    socket.emit('new answer');
                    socket.emit('total answer');

                    $http.get('api/findAnswers/' + question_id)
                        .success(function(data) {
                            $scope.listAnswerQuestion = data;
                        })
                        .error(function() {
                            console.log("error");
                        });

                    $http.get('api/answer/count/' + question_id)
                        .success(function(data) {
                            $scope.numberAnswer = data;
                        })
                        .error(function() {
                            console.log('error');
                        });
                });
        } else {
            flash.error = 'Nội dung trả lời không được để trống.';
            $scope.Proccess = false;
        }
    };

    $scope.deleteAnswer = function(id) {
        appAlert.confirm({
            title: 'Xóa',
            message: 'Bạn chắc chắn muốn xóa câu trả lời này ?'
        }, function(isOk) {
            if (isOk) {
                Answer.delete(id)
                    /*Nếu xóa thành công thì load lại dữ liệu*/
                    .success(function(data) {
                        flash.success = 'Xóa thành công!';
                        $http.get('api/findAnswers/' + question_id)
                            .success(function(data) {
                                $scope.listAnswerQuestion = data;
                            })
                            .error(function() {
                                console.log('error');
                            });
                        socket.emit('total answer');
                    });
            }
        });
    };
    $http.get('api/findTags/' + question_id)
        .success(function(data) {
            var a = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i].tagId;
                a.push(item.tagName);
            }

            $scope.oldTag = a;
        })
        .error(function() {
            console.log('error');
        });

    socket.on('new answer', function() {
        $http.get('api/findAnswers/' + question_id)
            .success(function(data) {
                $scope.listAnswerQuestion = data;
            })
            .error(function() {
                console.log('error');
            });

        $http.get('api/answer/count/' + question_id)
            .success(function(data) {
                $scope.numberAnswer = data;
            })
            .error(function() {
                console.log('error');
            });

        $http.get('api/user/vote')
            .success(function(vote) {
                $scope.listVote = vote;
            })
            .error(function() {
                console.log('error');
            });

        $http.get('api/user/vote/all')
            .success(function(all) {
                $scope.listAllVote = all;
            })
            .error(function() {
                console.log('error');
            });
    });

    $scope.editQuestion = function() {
        $scope.Proccess = true;
        if (!$.isEmptyObject($scope.questionData)) {
            Question.edit($scope.questionData)
                .success(function(data) {
                    $scope.Proccess = false;
                    $('.edit_question_form').fadeOut();
                    flash.success = 'Sửa câu hỏi thành công!';
                });
        } else {
            flash.error = 'Bạn phải điền đầy đủ nội dung.';
            $scope.Proccess = false;
        }
    };

    $scope.voteUp = function(id) {
        $http.get('/loggedin')
            .success(function(data) {
                if (data !== '0') {
                    $http.get('api/question/vote_up/' + id)
                        .success(function(data) {
                            if (parseInt(data) == 1) {
                                flash.success = 'Bạn đã BỎ thích câu hỏi này!';
                            } else {
                                $http.get('api/question/detail/' + id)
                                    .success(function(data) {
                                        if ($cookieStore.get('currentUser')._id != data.userId._id) {
                                            Notifi.create({
                                                userRecive: data.userId._id,
                                                userSend: $cookieStore.get('currentUser')._id,
                                                content: $cookieStore.get('currentUser').displayName + ' đã thích câu hỏi ' + data.title,
                                                questionId: id
                                            });
                                            socket.emit('voteup', {
                                                userSendName: $cookieStore.get('currentUser').displayName,
                                                userReciveId: data.userId._id,
                                                userTitle: data.title,
                                                questionIds: id
                                            });
                                        }

                                    })
                                    .error(function() {
                                        console.log('error');
                                    });
                                flash.success = 'Bạn đã thích câu hỏi này!';
                            }
                            Question.get()
                                .success(function(question) {
                                    $scope.listQuestion = question;
                                    $http.get('api/questiontag/getall')
                                        .success(function(tag) {
                                            $scope.listTag = tag;
                                        })
                                        .error(function() {
                                            console.log('error');
                                        });
                                });

                            $http.get('api/question/detail/' + id)
                                .success(function(data) {
                                    $scope.questionDetail = data;
                                    $scope.formAnswer.question_id = data._id;
                                })
                                .error(function() {
                                    console.log("error");
                                });

                            $http.get('api/user/vote')
                                .success(function(vote) {
                                    $scope.listVote = vote;
                                })
                                .error(function() {
                                    console.log('error');
                                });

                            $http.get('api/user/vote/all')
                                .success(function(all) {
                                    $scope.listAllVote = all;
                                })
                                .error(function() {
                                    console.log('error');
                                });
                        })
                        .error(function() {
                            console.log('error');
                        });
                } else {
                    flash.error = 'Bạn cần đăng nhập để bình chọn !';
                }
            });
    };

    $scope.voteDown = function(id) {
        $http.get('/loggedin').success(function(data) {
            if (data !== '0') {
                $http.get('api/question/vote_down/' + id)
                    .success(function(data) {
                        if (parseInt(data) == 1) {
                            flash.success = 'Bạn đã BỎ không thích câu hỏi này!';
                        } else {
                            flash.success = 'Bạn không thích câu hỏi này!';
                        }
                        Question.get()
                            .success(function(data) {
                                $scope.listQuestion = data;
                                $http.get('api/questiontag/getall')
                                    .success(function(data) {
                                        $scope.listTag = data;
                                    })
                                    .error(function() {
                                        console.log('error');
                                    });
                            });

                        $http.get('api/question/detail/' + id)
                            .success(function(data) {
                                $scope.questionDetail = data;
                                $scope.formAnswer.question_id = data._id;
                            })
                            .error(function() {
                                console.log("error");
                            });

                        $http.get('api/user/vote')
                            .success(function(vote) {
                                $scope.listVote = vote;
                            })
                            .error(function() {
                                console.log('error');
                            });

                        $http.get('api/user/vote/all')
                            .success(function(all) {
                                $scope.listAllVote = all;
                            })
                            .error(function() {
                                console.log('error');
                            });
                    })
                    .error(function() {
                        console.log('error');
                    });
            } else {
                flash.error = 'Bạn cần đăng nhập để bình chọn !';
            }
        });
    };

    $scope.listFavorite = [];
    $scope.listVote = [];
    if ($rootScope.currentUser) {
        $http.get('api/user/favorite')
            .success(function(data) {
                $scope.listFavorite = data;
            })
            .error(function() {
                console.log('error');
            });

        $http.get('api/user/vote')
            .success(function(vote) {
                $scope.listVote = vote;
            })
            .error(function() {
                console.log('error');
            });
    }
    $scope.listAllFavorite = [];
    $http.get('api/user/favorite/all')
        .success(function(all) {
            $scope.listAllFavorite = all;
        })
        .error(function() {
            console.log('error');
        });

    $scope.Favorite = function(id) {
        $http.get('/loggedin')
            .success(function(data) {
                if (data !== '0') {
                    $http.get('api/question/favorite/' + id)
                        .success(function(favorite) {

                            if (parseInt(favorite) == 1) {
                                flash.success = 'Bỏ theo dõi thành công!';
                            } else {
                                $http.get('api/question/detail/' + id)
                                    .success(function(data) {
                                        Notifi.create({
                                            userRecive: data.userId._id,
                                            userSend: $cookieStore.get('currentUser')._id,
                                            content: $cookieStore.get('currentUser').displayName + ' đã theo dõi câu hỏi ' + data.title,
                                            questionId: id
                                        });
                                        socket.emit('Favorite', {
                                            userSendName: $cookieStore.get('currentUser').displayName,
                                            userReciveId: data.userId._id,
                                            userTitle: data.title,
                                            questionIds: id
                                        });
                                    })
                                    .error(function() {
                                        console.log('error');
                                    });

                                flash.success = 'Bạn đã theo dõi câu hỏi này!';
                            }

                            Question.get()
                                .success(function(question) {
                                    $scope.listQuestion = question;
                                    $http.get('api/questiontag/getall')
                                        .success(function(tag) {
                                            $scope.listTag = tag;
                                        })
                                        .error(function() {
                                            console.log('error');
                                        });
                                });
                            $http.get('api/user/favorite')
                                .success(function(data) {
                                    $scope.listFavorite = data;
                                })
                                .error(function() {
                                    console.log('error');
                                });
                            $http.get('api/user/favorite/all')
                                .success(function(all) {
                                    $scope.listAllFavorite = all;
                                })
                                .error(function() {
                                    console.log('error');
                                });
                        })
                        .error(function() {
                            console.log('error');
                        });
                } else {
                    flash.error = 'Bạn cần đăng nhập để bình chọn !';
                }
            });
    };

    $scope.reportQuestion = function(id, user) {
        $http.get('/loggedin')
            .success(function(data) {
                if (data !== '0') {
                    Question.checkReport(id)
                        .success(function(data) {
                            if (data != null) {
                                flash.error = 'Bạn đã báo cáo câu hỏi này vi phạm rồi!';
                            } else {
                                appAlert.report({
                                    title: 'Xác nhận',
                                    message: 'Bạn chắc chắn muốn báo cáo câu hỏi này vi phạm?'
                                }, function(isOk) {
                                    if (isOk) {
                                        Question.report({
                                            questionId: id,
                                            userId: user,
                                            content: $('#reportContent').val()
                                        })
                                            .success(function() {
                                                $http.get('api/question/detail/' + id)
                                                    .success(function(data) {
                                                        $http.get('api/admin')
                                                            .success(function(user) {
                                                                for (var i in user) {
                                                                    var item = user[i];
                                                                    Notifi.create({
                                                                        userRecive: item._id,
                                                                        userSend: $cookieStore.get('currentUser')._id,
                                                                        content: $cookieStore.get('currentUser').displayName + ' báo cáo vi phạm câu hỏi ' + data.title,
                                                                        questionId: id
                                                                    });
                                                                    socket.emit('reportQuestion', {
                                                                        userSendName: $cookieStore.get('currentUser').displayName,
                                                                        userReciveId: data.userId._id,
                                                                        userTitle: data.title,
                                                                        questionIds: id
                                                                    });
                                                                }
                                                            });
                                                    })
                                                    .error(function() {
                                                        console.log('error');
                                                    });
                                            });
                                        flash.success = 'Báo cáo vi phạm thành công!';
                                    }
                                });
                            }
                        });
                } else {
                    flash.error = 'Bạn cần đăng nhập để báo cáo vi phạm';
                }
            });
    };
}])

.controller('CountQuestionController', ['$scope', 'socket', '$rootScope', '$http', 'Question', function($scope, socket, $rootScope, $http, Question) {
    /*Đếm số câu hỏi trong hệ thống*/
    $http.get('api/question/count')
        .success(function(data) {
            $rootScope.countQuestion = data;
        })
        .error(function() {
            console.log('error');
        });
    // Total Question
    socket.on('new question', function() {
        $http.get('api/question/count')
            .success(function(data) {
                $rootScope.countQuestion = data;
            })
            .error(function() {
                console.log("error");
            });
    });
}])

.controller('PopularQuestionController', ['$scope', '$http', 'Question', function($scope, $http, Question) {
    /*Lấy câu hỏi phổ biến*/
    $scope.popularQuestion = [];
    $http.get('api/question/popular')
        .success(function(data) {
            $scope.popularQuestion = data;
        })
        .error(function() {
            console.log('error');
        });
}])

.controller('QuestionDetail', ['$scope', '$http', '$state', '$stateParams', 'flash', 'Question', '$mdBottomSheet', function($scope, $http, $state, $stateParams, flash, Question, $mdBottomSheet) {
    var question_id = $stateParams.id;
    $http.get('api/question/detail/' + question_id)
        .success(function(data) {
            $scope.formData = data;
        })
        .error(function() {
            console.log('error');
        });

    $http.get('api/findTags/' + question_id)
        .success(function(data) {
            var a = [];
            for (var i = 0; i < data.length; i++) {
                var item = data[i].tagId;
                a.push(item.tagName);
            }
            $scope.oldTag = a;
        })
        .error(function() {
            console.log('error');
        });

    $scope.editQuestion = function() {
        $scope.Proccess = true;
        if (!$.isEmptyObject($scope.formData)) {
            Question.edit($scope.formData)
                .success(function(data) {
                    $scope.formData = {};
                    $scope.form.$setPristine();
                    $scope.Proccess = false;
                    flash.success = 'Sửa câu hỏi thành công!';
                    $state.go('system-question');
                });
        } else {
            flash.error = 'Bạn phải điền đầy đủ nội dung.';
            $scope.Proccess = false;
        }
    };
}]);
