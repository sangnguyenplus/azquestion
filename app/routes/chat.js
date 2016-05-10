var Chat = require('../models/chat');
var User = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;
var listChat;

module.exports = function(app, passport) {
    app.post('/api/chat/create', function(req, res, done) {
        Chat.create({
            userSend: req.user._id,
            userRecive: req.body.userRecive,
            msg: req.body.msg,
            status: req.body.status,
            creationDate: new Date(),
        }, function(err, msgs) {
            if (err) {
                return res.send(err);
            }

            Chat.find({}).sort({
                creationDate: -1
            }).exec(function(err, msgs) {
                if (err) {
                    return res.send(err)
                }
                return res.json(msgs);
            });
        });

    });
    app.get('/api/chat/:user_id', function(req, res) {
        var id = req.params.user_id;
        Chat.find().or([
            {
                $and: [{
                    userSend: req.user._id
                }, {
                    userRecive: id
                }]
            },
            {
                $and: [{
                    userRecive: req.user._id
                }, {
                    userSend: id
                }]
            }
        ])
            .populate('userSend')
            .populate('userRecive')
            .exec(function(err, msg) {
                if (err) {
                    return res.send(err)
                }
                return res.json(msg);
            });
    });
    app.get('/api/chat/count/:userRecive', function(req, res) {
        var id = req.params.userRecive;
        Chat.aggregate(
            {
                $group: {
                    _id: '$userSend',
                    userRecive: {
                        $last: '$userRecive'
                    },
                    msg: {
                        $last: '$msg'
                    },
                    userSend: {
                        $last: '$userSend'
                    },
                    status: {
                        $last: '$status'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    userRecive: 1,
                    userSend: 1,
                    msg: 1,
                    status: 1
                }
            },
            {
                $match: {
                    $and: [{
                        'userRecive': {
                            $eq: new ObjectId(id)
                        }
                    }, {
                        'status': {
                            $eq: false
                        }
                    }]
                }
            }, function(err, count) {
                if (err) {
                    return res.send(err)
                }
                return res.json(count.length);
            });
    });
    app.get('/api/chat/list/:userRecive', function(req, res) {
        var id = req.params.userRecive;
        Chat.aggregate(
            {
                $group: {
                    _id: (parseInt('$userRecive') * parseInt('$userSend')),
                    userRecive: {
                        $last: '$userRecive'
                    },
                    msg: {
                        $last: '$msg'
                    },
                    userSend: {
                        $last: '$userSend'
                    },
                    status: {
                        $last: '$status'
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    userRecive: 1,
                    userSend: 1,
                    msg: 1,
                    status: 1
                }
            },
            {
                $match: {
                    $or: [{
                        'userRecive': {
                            $eq: new ObjectId(id)
                        }
                    }, {
                        'userSend': {
                            $eq: new ObjectId(id)
                        }
                    }]
                }
            }, function(err, list) {
                if (err) {
                    return res.send(err);
                }
                list.forEach(function(item) {
                    User.findById(item.userRecive, '_id displayName avatar', function(err, userRecive) {
                        if (err) {
                            return res.send(err);
                        }
                        item.userRecive = userRecive;
                        User.findById(item.userSend, '_id displayName avatar', function(err, userSend) {
                            if (err) {
                                return res.send(err);
                            }
                            item.userSend = userSend;
                            listChat = list;
                        });
                    });
                });
                return res.json(listChat);
            });
    });
    app.get('/api/chat/update/:userRecive', function(req, res) {
        var id = req.params.userRecive;
        Chat.update({
            userRecive: id
        }, {
            $set: {
                status: true
            }
        }, {
            multi: true
        }).exec(function(err, chat) {
            if (err) {
                return res.send(err);
            }
            return res.json(chat);
        });
    });
}
