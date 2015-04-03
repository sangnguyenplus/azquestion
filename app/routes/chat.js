
var Chat = require('../models/chat');
var User = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;
var listChat;

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
        Chat.aggregate(
            {$group: {_id: "$userSend", userRecive: {$last: '$userRecive'},msg: { $last: "$msg" }, userSend: { $last: "$userSend" },status: { $last: "$status" }}},
        	{$project: {_id : 0,userRecive : 1, userSend : 1, msg: 1, status: 1}},
        	{$match: {$and: [{"userRecive" : {$eq: new ObjectId(id)}}, {"status": {$eq: false}}] } },
        	 function(err, count){
        	if (err)
				res.send(err)
			res.json(count.length);
        });
     });
	app.get('/api/chat/list/:userRecive', function(req, res){
		var id=req.params.userRecive;
        Chat.aggregate(
            {$group: {_id : "$userRecive", userRecive: {$last: '$userRecive'},msg: { $last: "$msg" }, userSend: { $last: "$userSend" },status: { $last: "$status" }}},
        	{$project: {_id : 0,userRecive : 1, userSend : 1, msg: 1, status: 1}},
        	{$match: {$or: [{"userRecive" : {$eq: new ObjectId(id)}}, {"userSend": {$eq: new ObjectId(id)}}] } },
        	 function(err, list){
        	if (err)
				res.send(err)
			list.forEach(function(item){
				User.find({_id:item.userRecive}).select('_id displayName avatar').exec(function(err, userRecive){
		        	if (err)
						res.send(err);
					item.userRecive=userRecive;
					User.find({_id:item.userSend}).select('_id displayName avatar').exec(function(err, userSend){
			        	if (err)
							res.send(err);
						item.userSend=userSend;
						listChat=list;
			        });
		        });
			});
			res.json(listChat);
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