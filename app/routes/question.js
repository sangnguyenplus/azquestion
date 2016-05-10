var Answer = require('../models/answer');
var User = require('../models/user');
var Question = require('../models/question');
var Tag = require('../models/tag');
var QuestionTag = require('../models/questiontag');
var Favorite = require('../models/favorite');
var Vote = require('../models/vote');
var Report = require('../models/report');
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');

var configMail = require('../../config/mail');


module.exports = function(app, passport) {
    //Lấy toàn bộ câu hỏi
    app.get('/api/question', function(req, res) {
        Question.find({
            status: true
        }).populate('userId').exec(function(err, questions) {
            if (err) {
                return res.send(err);
            }
            return res.json(questions);
        });
    });
    app.get('/api/question/all', function(req, res) {
        Question.find({}).populate('userId').exec(function(err, questions) {
            if (err) {
                return res.send(err);
            }
            return res.json(questions);
        });
    });
    // Search Title
    app.get('/api/title/search/:title', function(req, res) {
        var title = req.params.title;
        Question.find({
            $text: {
                '$search': title
            }
        }, {
            score: {
                $meta: 'textScore'
            }
        }).sort({
            score: {
                $meta: 'textScore'
            }
        }).exec(function(err, questions) {
            if (err) {
                return res.send(err);
            }
            return res.json(questions);
        });
    });
    app.get('/api/question/count', function(req, res) {
        Question.count(function(err, question) {
            if (err) {
                return res.send(err);
            }
            return res.json(question);
        });
    });
    //Lấy câu hỏi nổi bật - show ở trang chủ
    app.get('/api/question/popular', function(req, res) {
        Question.find({
            status: true
        }).where('creationDate').gt(new Date() - 3600 * 1000 * 24 * 7).populate({
            path: 'userId',
            select: 'avatar',
            options: {
                limit: 5
            }
        })
            .select('title creationDate userId')
            .sort('-score')
            .exec(function(err, questions) {
                if (err) {
                    return res.send(err);
                }
                return res.json(questions);
            });
    });
    //Quản lý câu hỏi
    app.post('/api/question/create', function(req, res) {
        // Thêm câu hỏi mới.
        var newQuestion = new Question();
        newQuestion.title = req.body.title;
        newQuestion.content = req.body.content;
        newQuestion.userId = req.user._id;

        var listTag = req.body.tag;
        newQuestion.creationDate = new Date();
        newQuestion.activeToken = randtoken.generate(60);
        if (req.user.reputation >= 10 || req.user.role == 'admin') {
            newQuestion.status = true;
            //Cộng 2 điểm cho thành viên đăng bài ngay nếu đó là thành viên chính thức
            User.findById(req.user._id, function(err, u) {
                if (err) {
                    return res.send(err);
                }
                u.reputation += 2;
                u.save(function(err, u) {
                    if (err) {
                        return res.send(err);
                    }
                });
            });
        //Nếu chưa phải là thành viên chính thức thì sẽ được cộng điểm sau khi bài viết được chấp nhận
        } else {
            newQuestion.status = false;
        }
        newQuestion.save(function(err, question) {
            if (err) {
                throw err;
            }
            if (question.status == false) {
                User.find({
                    role: 'admin'
                }).select('email').exec(function(err, user) {
                    if (err) {
                        return res.send(err);
                    }
                    var domain = req.headers.host || 'azquestion.com';
                    var mailOptions = {
                        from: 'Mạng xã hội hỏi đáp <' + configMail.gmail.user + '>', // Địa chỉ người gửi
                        to: user, //Danh sách người nhận, ngăn cách nhau bằng dấu phẩy
                        subject: 'Bài viết mới được đăng', // Tiêu đề thư
                        html: '<p><strong>Chào quản trị viên.</strong></p> <p>Có một bài viết với tiêu đề "<strong>' + question.title + '</strong>" mới được đăng trên &nbsp;azquestion.com bởi <strong>' + req.user.displayName + '</strong> (thành viên mới đăng ký).'
                            + ' Vui lòng truy cập http://' + domain + '/system/questions để kiểm tra và xét duyệt bài đăng này.</p>' // Nội dung dạng html
                    };

                    // Tạo đối tượng transporter dùng SMTP transport
                    var transporter = nodemailer.createTransport({
                        service: configMail.gmail.service,
                        auth: {
                            user: configMail.gmail.user,
                            pass: configMail.gmail.pass
                        }
                    });

                    // gửi mail với đối tượng transporter đã được khai báo
                    transporter.sendMail(mailOptions, function(error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                });
            }
            //Thêm các tag liên kết vào bảng QuestionTag
            listTag.forEach(function(item) {
                Tag.find({
                    tagName: item.tagName
                }).exec(function(err, t) {
                    if (err) {
                        return res.send(err);
                    }
                    t.forEach(function(item) {
                        var tag = new QuestionTag();
                        tag.questionId = question._id;
                        tag.tagId = item._id;
                        tag.save(function(err) {
                            if (err) {
                                throw err;
                            }
                        });
                    });

                    //Cập nhật số lần sử dụng của các tag lên 1 đơn vị
                    t.forEach(function(item) {
                        Tag.findById(item._id, function(err, tag) {
                            if (err) {
                                return res.send(err);
                            }
                            tag.count += 1;
                            tag.save(function(err, tag) {
                                if (err) {
                                    return res.send(err);
                                }
                            });
                        });
                    });
                });
            });
            return res.json(question);
        });
    });
    //Chi tiết câu hỏi
    app.get('/api/question/detail/:question_id', function(req, res) {
        var id = req.params.question_id;
        Question.findById(id).populate('userId').exec(function(err, question) {
            if (err) {
                return res.send(err)
            }
            return res.json(question);
        });
    });
    app.get('/api/findAnswers/:question_id', function(req, res) {
        var id = req.params.question_id;
        Question.findAnswers(id).populate('userId').exec(function(err, answer) {
            if (err) {
                return res.send(err);
            }
            return res.json(answer);
        });
    });
    //Lấy tag theo question id
    app.get('/api/findTags/:question_id', function(req, res) {
        var id = req.params.question_id;
        Question.findTags(id).populate('tagId').exec(function(err, tag) {
            if (err) {
                return res.send(err);
            }
            return res.json(tag);
        });
    });
    //Xóa câu hỏi
    app.delete('/api/question/detete/:question_id', function(req, res) {
        var id = req.params.question_id;

        //Trừ 2 điểm trên số điểm của thành viên đăng bài
        Question.findById(id).populate({
            path: 'userId',
            select: '_id'
        }).exec(function(err, q) {
            if (q.status == true) {
                User.findById(q.userId._id, function(err, u) {
                    if (err) {
                        return res.send(err);
                    }
                    if (u.reputation >= 2) {
                        u.reputation -= 2;
                    }
                    u.save(function(err, u) {
                        if (err) {
                            return res.send(err);
                        }
                    });
                });
            }
        });

        //Giảm số lần sử dụng các tag có trong câu hỏi xuống 1 đơn vị
        Question.findTags(id).populate({
            path: 'tagId',
            select: '_id'
        }).exec(function(err, t) {
            if (err) {
                return res.send(err);
            }
            t.forEach(function(item) {
                Tag.findById(item.tagId, function(err, tag) {
                    if (err) {
                        return res.send(err);
                    }
                    if (tag.count > 0) {
                        tag.count -= 1;
                    }
                    tag.save(function(err, tag) {
                        if (err) {
                            return res.send(err);
                        }
                    });
                });
            });
        });

        //Xóa các tag liên kết trước khi xóa câu hỏi
        QuestionTag.remove({
            questionId: id
        }, function(err, tags) {
            if (err) {
                return res.send(err);
            }
        });

        //Xóa tất cả các câu trả lời trong câu hỏi này
        Answer.remove({
            questionId: id
        }, function(err, answers) {
            if (err) {
                return res.send(err);
            }
        });
        Vote.remove({
            questionId: id
        }, function(err, vote) {
            if (err) {
                return res.send(err);
            }
        });
        Favorite.remove({
            questionId: id
        }, function(err, favorite) {
            if (err) {
                return res.send(err);
            }
        });

        Question.remove({
            _id: id
        }, function(err, questions) {
            if (err) {
                return res.send(err);
            }

            // Trả về danh sách câu hỏi mới.
            Question.find({}).populate('userId').exec(function(err, questions) {
                if (err) {
                    return res.send(err)
                }
                return res.json(questions);
            });
        });
    });

    //Lấy toàn bộ giá trị trong questionTag
    app.get('/api/questiontag/getall', function(req, res) {
        QuestionTag.find({}).populate('tagId').exec(function(err, tags) {
            if (err) {
                return res.send(err)
            }
            return res.json(tags);
        });
    });

    // Thích câu hỏi
    app.get('/api/question/vote_up/:question_id', function(req, res) {
        var id = req.params.question_id;
        Vote.findOne({
            $and: [{
                questionId: id
            }, {
                userId: req.user._id
            }]
        })
            .exec(function(err, data) {
                if (err) {
                    return res.send(err);
                }
                if (data != null) {
                    if (data.type == true) {
                        Vote.remove({
                            _id: data._id
                        }, function(err, d) {
                            if (err) {
                                return res.send(err);
                            }
                            Question.findById(id, function(err, question) {
                                if (err) {
                                    return res.send(err);
                                }
                                question.score -= 1;
                                question.save(function(err, q) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                });
                            });
                            return res.json(d);
                        });
                    } else {
                        Vote.remove({
                            _id: data._id
                        }, function(err, d) {
                            if (err) {
                                return res.send(err);
                            }
                            var vote = new Vote();
                            vote.questionId = id;
                            vote.userId = req.user._id;
                            vote.type = true;
                            vote.creationDate = new Date();
                            vote.save(function(err, v) {
                                if (err) {
                                    return res.send(err);
                                }
                                Question.findById(id, function(err, question) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                    question.score += 2;
                                    question.save(function(err, q) {
                                        if (err) {
                                            return res.send(err);
                                        }
                                        return res.json(q);
                                    });
                                });
                            });
                        });
                    }
                } else {
                    var vote = new Vote();
                    vote.questionId = id;
                    vote.userId = req.user._id;
                    vote.type = true;
                    vote.creationDate = new Date();
                    vote.save(function(err, v) {
                        if (err) {
                            return res.send(err);
                        }
                        Question.findById(id, function(err, question) {
                            if (err) {
                                return res.send(err);
                            }
                            question.score += 1;
                            question.save(function(err, q) {
                                if (err) {
                                    return res.send(err);
                                }
                                return res.json(q);
                            });
                        });
                    });
                }
            });
    });

    //Không thích hoặc bỏ thích
    app.get('/api/question/vote_down/:question_id', function(req, res) {
        var id = req.params.question_id;
        Vote.findOne({
            $and: [{
                questionId: id
            }, {
                userId: req.user._id
            }]
        })
            .exec(function(err, data) {
                if (err) {
                    return res.send(err);
                }
                if (data != null) {
                    if (data.type == false) {
                        Vote.remove({
                            _id: data._id
                        }, function(err, d) {
                            if (err) {
                                return res.send(err);
                            }
                            Question.findById(id, function(err, question) {
                                if (err) {
                                    return res.send(err);
                                }
                                question.score += 1;
                                question.save(function(err, q) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                });
                            });
                            return res.json(d);
                        });
                    } else {
                        Vote.remove({
                            _id: data._id
                        }, function(err, d) {
                            if (err) {
                                return res.send(err);
                            }
                            var vote = new Vote();
                            vote.questionId = id;
                            vote.userId = req.user._id;
                            vote.type = false;
                            vote.creationDate = new Date();
                            vote.save(function(err, v) {
                                if (err) {
                                    return res.send(err);
                                }
                                Question.findById(id, function(err, question) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                    question.score -= 2;
                                    question.save(function(err, q) {
                                        if (err) {
                                            return res.send(err);
                                        }
                                        return res.json(q);
                                    });
                                });
                            });
                        });
                    }
                } else {
                    var vote = new Vote();
                    vote.questionId = id;
                    vote.userId = req.user._id;
                    vote.type = false;
                    vote.creationDate = new Date();
                    vote.save(function(err, v) {
                        if (err) {
                            return res.send(err);
                        }
                        Question.findById(id, function(err, question) {
                            if (err) {
                                return res.send(err);
                            }
                            question.score -= 1;
                            question.save(function(err, q) {
                                if (err) {
                                    return res.send(err);
                                }
                                return res.json(q);
                            });
                        });
                    });
                }
            });
    });

    //Gắn dấu sao cho câu hỏi
    app.get('/api/question/favorite/:question_id', function(req, res) {
        var id = req.params.question_id;
        Favorite.findOne({
            $and: [{
                questionId: id
            }, {
                userId: req.user._id
            }]
        })
            .exec(function(err, data) {
                if (err) {
                    return res.send(err);
                }
                if (data != null) {
                    Favorite.remove({
                        _id: data._id
                    }, function(err, d) {
                        if (err) {
                            return res.send(err);
                        }
                        return res.json(d);
                    });
                } else {
                    var favorite = new Favorite();
                    favorite.questionId = id;
                    favorite.userId = req.user._id;
                    favorite.save(function(err, f) {
                        if (err) {
                            return res.send(err);
                        }
                        return res.json(f);
                    });
                }
            });
    });

    // Lấy các user gắn dấu sao theo câu hỏi
    app.get('/api/findFavorite/:question_id', function(req, res) {
        var id = req.params.question_id;
        Favorite.find({
            questionId: id
        }).populate('userId').exec(function(err, favorite) {
            return res.json(favorite);
        });
    });
    app.post('/api/question/edit', function(req, res) {
        Question.findById(req.body._id).populate('userId').exec(function(err, question) {
            question.title = req.body.title;
            question.content = req.body.content;
            question.lastEditDate = new Date();
            var listTag = req.body.tag;
            question.save(function(err, question) {
                if (err) {
                    throw err;
                }
                if (listTag && listTag.length != 0) {
                    Question.findTags(req.body._id).populate('tagId').exec(function(err, data) {
                        //Giảm số lần sử dụng các tag trong câu hỏi này
                        data.forEach(function(item) {
                            Tag.findOne({
                                tagName: item.tagId.tagName
                            }).exec(function(err, tag) {
                                if (err) {
                                    return res.send(err);
                                }
                                //Cập nhật số lần sử dụng của các tag giảm 1 đơn vị;
                                if (tag.count > 0) {
                                    tag.count -= 1;
                                }
                                tag.save(function(err, tag) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                });
                            });
                        });
                    });

                    // Xóa hết tag cũ liên kết tới câu hỏi này.
                    QuestionTag.remove({
                        questionId: question._id
                    }, function(err, q) {
                        if (err) {
                            return res.send(err);
                        }
                    });

                    //Thêm các tag liên kết vào bảng QuestionTag
                    listTag.forEach(function(listitem) {
                        Tag.find({
                            tagName: listitem.tagName
                        }).exec(function(err, t) {
                            if (err) {
                                return res.send(err);
                            }
                            t.forEach(function(item) {
                                var tag = new QuestionTag();
                                tag.questionId = question._id;
                                tag.tagId = item._id;
                                tag.save(function(err) {
                                    if (err) {
                                        throw err;
                                    }
                                });
                            });

                            //Cập nhật số lần sử dụng của các tag lên 1 đơn vị
                            t.forEach(function(item) {
                                Tag.findById(item._id, function(err, tag) {
                                    if (err) {
                                        return res.send(err);
                                    }
                                    tag.count += 1;
                                    tag.save(function(err, tag) {
                                        if (err) {
                                            res.send(err);
                                        }
                                    });
                                });
                            });
                        });
                    });
                }
                return res.json(question);
            });
        });
    });
    app.get('/api/question/approve/:question_id', function(req, res) {
        Question.findById(req.params.question_id).populate('userId').exec(function(err, question) {
            question.status = true;
            question.save(function(err, q) {
                if (err) {
                    return res.send(err);
                }
                var mailOptions = {
                    from: 'Mạng xã hội hỏi đáp <' + configMail.gmail.user + '>', // Địa chỉ người gửi
                    to: question.userId.email, //Danh sách người nhận, ngăn cách nhau bằng dấu phẩy
                    subject: 'Bài viết đã được xét duyệt', // Tiêu đề thư
                    html: '<p><strong>Chào ' + question.userId.displayName + '.</strong></p> <p>Câu hỏi "<strong>' + question.title + '</strong>" của bạn đã được đăng. Hãy bắt đầu thảo luận về chủ đề bạn thắc mắc nhé.</p>' // Nội dung dạng html
                };

                // Tạo đối tượng transporter dùng SMTP transport
                var transporter = nodemailer.createTransport({
                    service: configMail.gmail.service,
                    auth: {
                        user: configMail.gmail.user,
                        pass: configMail.gmail.pass
                    }
                });

                // gửi mail với đối tượng transporter đã được khai báo
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    }
                });

                //Cộng điểm cho thành viên sau khi bài đăng được xét duyệt
                User.findById(question.userId._id, function(err, u) {
                    if (err) {
                        return res.send(err);
                    }
                    u.reputation += 2;
                    u.save(function(err, u) {
                        if (err) {
                            return res.send(err);
                        }
                    });
                });
                Question.find({}).populate('userId').exec(function(err, questions) {
                    if (err) {
                        return res.send(err)
                    }
                    return res.json(questions);
                });
            });
        });
    });
    app.get('/api/question/getQuestionByUser/:user_id', function(req, res) {
        Question.find({
            userId: req.params.user_id
        }).populate('userId').exec(function(err, list) {
            if (err) {
                return res.send(err);
            }
            return res.json(list);
        });
    });
    app.get('/api/question/report/:question_id', function(req, res, done) {
        var id = req.params.question_id;
        Report.findOne({
            $and: [{
                questionId: id
            }, {
                userReported: req.user._id
            }]
        }).exec(function(err, data) {
            if (err) {
                return res.send(err);
            }
            return res.json(data);
        });

    });
    app.post('/api/question/report/create', function(req, res, done) {
        Report.create({
            userReported: req.user._id,
            userId: req.body.userId,
            questionId: req.body.questionId,
            content: req.body.content,
            type: 'question',
            creationDate: new Date(),
        }, function(err, report) {
            if (err) {
                return res.send(err);
            }
            return res.json(report);
        });
    });
}
