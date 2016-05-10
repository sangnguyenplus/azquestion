var Answer = require('../models/answer');
var User = require('../models/user');
var Question = require('../models/question');
var Tag = require('../models/tag');
var Badge = require('../models/badge');
var Favorite = require('../models/favorite');
var QuestionTag = require('../models/questiontag');
var Vote = require('../models/vote');
var nodemailer = require('nodemailer');
var randtoken = require('rand-token');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');

var configMail = require('../../config/mail');

module.exports = function(app, passport) {

    app.post('/api/user/upload/avatar', function(req, res) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function(fieldname, file, filename) {
            console.log('Uploading: ' + filename);
            var extension = (/[.]/.exec(filename)) ? /[^.] + $/.exec(filename) : undefined;
            var strand = randtoken.generate(20);
            fstream = fs.createWriteStream('public/uploads/users/' + strand + '.' + extension);
            file.pipe(fstream);
            fstream.on('close', function(err) {
                if (err) {
                    return res.send(err);
                }
                return res.send(strand + '.' + extension);
            });
        });
    });

    app.get('/api/user/edit/avatar/:avatar', function(req, res) {
        User.findById(req.user._id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            user.avatar = '/uploads/users/' + req.params.avatar;
            user.save(function(err, user) {
                if (err) {
                    return res.send(err);
                }
                return res.json(user);
            });
        });
    });

    app.get('/api/user', function(req, res) {
        User.find(function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
    });

    // Get User Admin
    app.get('/api/admin', function(req, res) {
        User.find({
            role: 'admin'
        }).select('_id').exec(function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
    });

    app.get('/api/people', function(req, res) {
        User.find({}, '-_id displayName', function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
    });

    app.get('/api/countUser', function(req, res) {
        User.find({
            status: 1
        }).count(function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
    });

    app.get('/api/user/count/question/:user_id', function(req, res) {
        var id = req.params.user_id;
        Question.count({
            userId: id
        }, function(err, c) {
            if (err) {
                return res.send(err);
            }
            return res.json(c);
        });
    });

    app.get('/api/user/count/answer/:user_id', function(req, res) {
        var id = req.params.user_id;
        Answer.count({
            userId: id
        }, function(err, c) {
            if (err) {
                return res.send(err);
            }
            return res.json(c);
        });
    });

    app.get('/api/user/profile/:user_id', function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.json(user);
        });
    });

    app.delete('/api/user/delete/:user_id', function(req, res) {
        var id = req.params.user_id;
        if (id == req.user._id) {
            return res.send({
                'error_msg': 'Lỗi. Bạn không thể xóa chính mình.'
            });
        } else {
            //Tìm tất cả các câu hỏi được đăng bởi thành viên này
            Question.find({
                userId: id
            }, function(err, questions) {
                if (err) {
                    return res.send(err);
                }
                questions.forEach(function(item) {
                    QuestionTag.remove({
                        questionId: item._id
                    }, function(err, tags) {
                        if (err) {
                            return res.send(err);
                        }
                    });

                    Answer.find({
                        questionId: item._id
                    }, function(err, answers) {
                        answers.forEach(function(i) {
                            Vote.remove({
                                answerId: i._id
                            }, function(err) {
                                if (err) {
                                    return res.send(err);
                                }
                            });
                        });
                    });

                    //Xóa tất cả các câu trả lời trong câu hỏi này
                    Answer.remove({
                        questionId: item._id
                    }, function(err, answers) {
                        if (err) {
                            return res.send(err);
                        }
                    });

                    Vote.remove({
                        questionId: item._id
                    }, function(err, vote) {
                        if (err) {
                            return res.send(err);
                        }
                    });

                    Favorite.remove({
                        questionId: item._id
                    }, function(err, favorite) {
                        if (err) {
                            return res.send(err);
                        }
                    });
                });
            });

            //Sau khi loại bỏ hết các liên kết tới câu hỏi đó thì xóa nó
            Question.remove({
                userId: id
            }, function(err, questions) {
                if (err) {
                    return res.send(err);
                }
            });

            //Tìm tất cả các câu trả lời của thành viên này và xóa hết các vote liên quan
            Answer.find({
                userId: id
            }, function(err, answers) {
                if (err) {
                    return res.send(err);
                }
                answers.forEach(function(item) {
                    Vote.remove({
                        answerId: item._id
                    }, function(err, a) {
                        if (err) {
                            return res.send(err);
                        }
                    });
                });
            });

            //Xóa tất cả các câu trả lời của thành viên này
            Answer.remove({
                userId: id
            }, function(err, answers) {
                if (err) {
                    return res.send(err);
                }
            });

            //Xóa đánh giá
            Vote.remove({
                userId: id
            }, function(err, votes) {
                if (err) {
                    return res.send(err);
                }
            });

            //Xóa mục yêu thích
            Favorite.remove({
                userId: id
            }, function(err, favorites) {
                if (err) {
                    return res.send(err);
                }
            });

            User.remove({
                _id: id
            }, function(err, users) {
                if (err) {
                    return res.send(err);
                }
                User.find(function(err, users) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.json(users);
                });
            });
        }
    });

    app.get('/api/user/favorite', function(req, res) {
        Favorite.find({
            userId: req.user._id
        }, function(err, list) {
            if (err) {
                return res.send(err);
            }
            return res.json(list);
        });
    });

    app.get('/api/user/favorite/all', function(req, res) {
        Favorite.find({}, function(err, list) {
            if (err) {
                return res.send(err);
            }
            return res.json(list);
        });
    });

    app.get('/api/user/vote', function(req, res) {
        Vote.find({
            userId: req.user._id
        }, function(err, list) {
            if (err) {
                return res.send(err);
            }
            return res.json(list);
        });
    });

    app.get('/api/user/vote/all', function(req, res) {
        Vote.find({}, function(err, list) {
            if (err) {
                return res.send(err);
            }
            return res.json(list);
        });
    });

    app.get('/api/user/active/:user_id/:token', function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            var token = req.params.token;
            if (user.activeToken == token) {
                user.status = 1;
            }
            user.save(function(err, u) {
                if (err) {
                    return res.send(err);
                }
                return res.json(u);
            });
        });
    });

    app.post('/api/user/getUserbyEmail', function(req, res) {
        User.find({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                return res.send(err);
            }
            return res.send(user);
        });
    });

    app.post('/api/user/edit', function(req, res) {
        User.findById(req.body._id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            user.displayName = req.body.displayName;
            user.location = req.body.location;
            user.website = req.body.website;
            user.birthday = req.body.birthday;
            user.save(function(err, u) {
                if (err) {
                    return res.send(err);
                }
                return res.json(u);
            });
        });
    });

    app.post('/api/user/changePassword', function(req, res, done) {
        User.findById(req.body._id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            if (!user || !user.validPassword(req.body.CurrentPassword)) {
                return done(null, false);
            } else {
                user.password = user.generateHash(req.body.NewPassword);
                user.lastEditDate = new Date();
                user.save(function(err, u) {
                    if (err) {
                        return res.send(err);
                    }
                    return res.json(u);
                });
            }
        });
    });

    app.post('/forgot', function(req, res) {
        async.waterfall([function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        }, function(token, done) {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // thời gian hết hạn tính theo ms

                user.save(function(err) {
                    return done(err, token, user);
                });
            });
        }, function(token, user, done) {
            var domain = req.headers.host || "azquestion.com";
            var mailOptions = {
                to: user.email,
                from: 'Mạng xã hội hỏi đáp <' + configMail.gmail.user + '>',
                subject: 'Email khôi phục mật khẩu',
                text: 'Bạn nhận được email này là vì bạn (hoặc ai đó) đã yêu cầu thay đổi mật khẩu tài khoản của bạn.\n\n' +
                    'Hãy click vào đường link dưới hoặc chép và dán vào khung nhập địa chỉ của trình duyệt để hoàn tất xử lý:\n\n' +
                    'http://' + domain + '/users/reset-password/' + token + '\n\n' +
                    'Nếu không phải bạn yêu cầu thay đổi tài khoản thì chỉ đơn giản bỏ qua email này.\n' +
                    'Lưu ý, email này chỉ có giá trị trong vòng 1 giờ đồng hồ kể từ lúc yêu cầu xử lý.'
            };

            // Tạo đối tượng transporter dùng SMTP transport
            var transporter = nodemailer.createTransport({
                service: configMail.gmail.service,
                auth: {
                    user: configMail.gmail.user,
                    pass: configMail.gmail.pass
                }
            });

            transporter.sendMail(mailOptions, function(err) {
                return done(err, 'done');
            });
        }
        ], function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/forgot');
        });
    });

    app.post('/api/user/resetPassword', function(req, res) {
        User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: {
                $gt: Date.now()
            }
        }, function(err, user) {
            if (!user) {
                return res.send({
                    'error_msg': 'Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã khác!'
                });
            } else {
                user.password = user.generateHash(req.body.NewPassword);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    var mailOptions = {
                        to: user.email,
                        from: 'Mạng xã hội hỏi đáp <' + configMail.gmail.user + '>',
                        subject: 'Mật khẩu đã được thay đổi',
                        text: 'Đây là email xác nhận mật khẩu tài khoản ' + user.displayName + ' đã được thay đổi.'
                    };

                    // Tạo đối tượng transporter dùng SMTP transport
                    var transporter = nodemailer.createTransport({
                        service: configMail.gmail.service,
                        auth: {
                            user: configMail.gmail.user,
                            pass: configMail.gmail.pass
                        }
                    });

                    transporter.sendMail(mailOptions, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });

                    req.logIn(user, function(err) {
                        res.json(user);
                    });
                });
            }
        });
    });

    app.post('/api/user/updatePermission', function(req, res) {
        User.findById(req.body._id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            user.role = req.body.role;
            user.lastEditDate = new Date();
            user.save(function(err, u) {
                if (err) {
                    return res.send(err);
                }
                return res.json(user);
            });
        });
    });

    app.post('/api/user/upload', function(req, res) {
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function(fieldname, file, filename) {
            console.log('Uploading: ' + filename);
            var extension = (/[.]/.exec(filename)) ? /[^.] + $/.exec(filename) : undefined;
            var strand = randtoken.generate(20);
            fstream = fs.createWriteStream('public/uploads/images/' + strand + '.' + extension);
            file.pipe(fstream);
            fstream.on('close', function(err) {
                if (err) {
                    return res.send(err);
                }
                return res.send(strand + '.' + extension);
            });
        });
    });

    app.get('/api/user/online/:user_id', function(req, res) {
        var id = req.params.user_id;
        User.findById(id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            user.online = 'true';
            user.save(function(err, u) {
                if (err) {
                    return res.send(err);
                }
                return res.json(user);
            });
        });
    });
    app.get('/api/user/offline/:user_id', function(req, res) {
        var id = req.params.user_id;
        User.findById(id, function(err, user) {
            if (err) {
                return res.send(err);
            }
            user.online = 'false';
            user.save(function(err, u) {
                if (err) {
                    return res.send(err);
                }
                return res.json(user);
            });
        });
    });
}
