
var Chat = require('../models/chat');

module.exports = function (app, passport) {
	app.post('/api/chat/create', function(req, res,done) {
			Chat.create({
				userSend : req.user._id,
				userRecive: req.body.userRecive,
				msg : req.body.msg,
				status: req.body.status,
				creationDate: new Date(),
			}, function(err, msgs) {
				if (err)
					res.send(err);

				Chat.find({}).sort({creationDate: -1}).exec(function(err, msgs) {
					if (err)
						res.send(err)
					res.json(msgs);
				});
			});

	});
	app.get('/api/chat/:user_id', function(req, res){
		var id=req.params.user_id;
		Chat.find().or([
			{$and: [{userSend: req.user._id}, {userRecive: id}]},
			{$and: [{userRecive: req.user._id}, {userSend: id}]}
		])
		.populate('userSend')
		.populate('userRecive')
		.exec(function(err, msg){
        	if (err)
				res.send(err)
			res.json(msg);
        });
	});
}