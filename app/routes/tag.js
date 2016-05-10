var Question = require('../models/question');
var Tag = require('../models/tag');
var QuestionTag = require('../models/questiontag');

module.exports = function(app, passport) {
    //Quản lý tag
    app.post('/api/tag/create', function(req, res, done) {
        Tag.findOne({
            'tagName': req.body.name
        }, function(err, existTag) {
            // nếu có lỗi thì trả về lỗi.
            if (err) {
                return done(err);
            }

            if (existTag) {
                return done(null, false);
            }
            // thực hiện thành công thì trả về thông tin user
            else {
                // Thêm câu hỏi mới
                Tag.create({
                    tagName: req.body.name,
                    description: req.body.description,
                    creationDate: new Date(),
                }, function(err, tags) {
                    if (err) {
                        return res.send(err);
                    }

                    // Trả về danh sách tag mới.
                    Tag.find({}).sort({
                        creationDate: -1
                    }).exec(function(err, tags) {
                        if (err) {
                            return res.send(err)
                        }
                        return res.json(tags);
                    });
                });
            }
        });
    });

    app.get('/api/tag/getTagById/:tag_id', function(req, res) {
        var id = req.params.tag_id;
        Tag.find({
            _id: id
        }).exec(function(err, tag) {
            if (err) {
                return res.send(err);
            }
            return res.json(tag);
        });
    });

    app.get('/api/tag/getTagByName/:tag_name', function(req, res) {
        var name = req.params.tag_name;
        Tag.find({
            tagName: name
        }).exec(function(err, tag) {
            if (err) {
                return res.send(err);
            }
            return res.json(tag);
        });
    });

    //Lấy toàn bộ tag
    app.get('/api/tag', function(req, res) {
        Tag.find({}).sort({
            created_at: -1
        }).exec(function(err, tags) {
            if (err) {
                return res.send(err)
            }
            return res.json(tags);
        });
    });

    app.get('/api/tag/count', function(req, res) {
        Tag.count(function(err, c) {
            if (err) {
                return res.send(err)
            }
            return res.json(c);
        });
    });

    //Lấy tag nổi bật - show ở trang chủ
    app.get('/api/tag/popular-home', function(req, res) {
        Tag.aggregate({
            $limit: 10
        }, function(err, tags) {
            if (err) {
                return res.send(err)
            }
            return res.json(tags);
        });
    });

    // Xóa tag
    app.delete('/api/tag/detete/:tag_id', function(req, res) {
        Tag.remove({
            _id: req.params.tag_id
        }, function(err, tags) {
            if (err) {
                return res.send(err);
            }

            // Trả về danh sách tag mới.
            Tag.find(function(err, tags) {
                if (err) {
                    return res.send(err);
                }
                return res.json(tags);
            });
        });
    });

    app.get('/api/getQuestionByTag/:tag_id', function(req, res) {
        var id = req.params.tag_id;
        Tag.getQuestionByTag(id).populate('questionId userId').exec(function(err, question) {
            return res.json(question);
        });
    });

    app.get('/api/tag/detail/:tag_id', function(req, res) {
        Tag.findById(req.params.tag_id, function(err, tag) {
            if (err) {
                return res.send(err);
            }
            return res.json(tag);
        });
    });

    app.post('/api/tag/edit', function(req, res) {
        Tag.findById(req.body._id, function(err, data) {
            if (err) {
                return res.send(err);
            }
            data.description = req.body.description;
            data.lastEditDate = new Date();
            data.save(function(err, t) {
                if (err) {
                    return res.send(err);
                }
                return res.send(t);
            });
        });
    });
}
