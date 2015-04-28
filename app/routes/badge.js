
var Badge = require('../models/badge');

module.exports = function (app, passport) {
	app.get('/api/badge', function(req, res){
		Badge.find({}).sort('-score').exec(function(err, badge){
			if(err)
				res.send(err);
			res.json(badge);
		});
	});
	app.post('/api/badge/create', function(req, res,done) {
		Badge.findOne({ 'name' :  req.body.name }, function(err, existBadge) {
        // nếu có lỗi thì trả về lỗi.
        if (err)
            return done(err);

        if (existBadge)
            return done(null, false);

        else{
			// Thêm danh hiệu mới
			Badge.create({
				name : req.body.name,
				score : req.body.score,
				description : req.body.description,
				color: req.body.color,
				creationDate: new Date(),
				lastEditDate: new Date(),
			}, function(err, badges) {
				if (err)
					res.send(err);

				// Trả về danh sách danh hiệu mới.
				Badge.find({}).sort({creationDate: -1}).exec(function(err, badges) {
					if (err)
						res.send(err)
					res.json(badges);
				});
			});
		}
		});

	});
	app.delete('/api/badge/detete/:badge_id', function(req, res) {
		Badge.remove({
			_id : req.params.badge_id
		}, function(err, badges) {
			if (err)
				res.send(err);

			// Trả về danh sách danh hiệu mới.
			Badge.find(function(err, badges) {
				if (err)
					res.send(err)
				res.json(badges);
			});
		});
	});
	app.get('/api/badge/detail/:badge_id', function(req,res){
		Badge.findById(req.params.badge_id, function(err, badge){
			if(err)
				res.send(err);
			res.json(badge);
		});
	});

	app.post('/api/badge/edit', function(req, res,done) {

		Badge.findById(req.body._id, function(err, data){
			if(err)
				res.send(err);
			/*if(data.name!=req.body.name){
				Badge.find({name:req.body.name})
				.where({_id: !data._id}).exec(function(err, existBadge){
					if(err)
						res.send(err);
					if(existBadge)
						res.send(b);
				});
			}
			else{*/
				data.name=req.body.name;
				data.score = req.body.score;
				data.description = req.body.description;
				data.color= req.body.color;
				data.lastEditDate= new Date();
				data.save(function(err, b){
					if(err)
						res.send(err);
					res.send(b);
				});
			/*}*/
		});

	});
}