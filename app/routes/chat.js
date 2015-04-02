
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
	app.get('/api/chat/count/:userRecive', function(req, res) {
		var id=req.params.userRecive;
        Chat.find( { $and: [ { status: false},{userRecive:id} ] } ).count(function(err, count){
        	if (err)
				res.send(err)
			res.json(count);
        });
     });
	app.get('/api/chat/list/:userRecive', function(req, res){
		var id=req.params.userRecive;
        Chat.find({userRecive:id}).group(userSend).populate('userRecive').populate('userSend').exec(function(err, list){
        	if (err)
				res.send(err)
			res.json(list);
        });
	});
	app.get('/api/chat/update/:userRecive',function(req,res)
	{
		var id=req.params.userRecive;
		Chat.update({userRecive:id }, { $set: { status: true }},{multi:true}).exec(function(err, chat)
			{
				if(err)
					res.send(err);
				res.json(chat);
			});
	});
}