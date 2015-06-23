var express = require('express');
var router = express.Router();
module.exports = router;
var fs = require('fs');
var tweetBank = require("./tweetbank");


var User = require('./models').User;


//Eager loading (Left Outer Join)
var Tweet = require("./models").Tweet;

router.get('/', function(req, res, next) {
	Tweet.findAll({include: [User] }).then(function(tweets){
  		var parsedTweets = JSON.parse(JSON.stringify(tweets));
		res.render('index', { tweets: parsedTweets, showForm:true });
	}, function(error){
		console.log("ERROR", error);
		res.sendStatus(404);
	});
  
});

router.post('/submit', function(req, res, next) {
	var nextPage = {};
  User.findOne({where: {name: req.body.name}}).then(function(user){
  	console.log(user);
  	if(!user){
  		return User.create({name: req.body.name});
  	}else{
  		return user;
  	}
  }).then(function(newUser){
  		nextPage.user = JSON.parse(JSON.stringify(newUser));
  		return Tweet.create({tweet: req.body.text, UserId: JSON.parse(JSON.stringify(newUser)).id});
  }).then(function(newTweet){
  		nextPage.tweets = JSON.parse("[" + JSON.stringify(newTweet) + "]");
  		console.log(nextPage);
  		res.render('profile', nextPage);
  });	
  
});

router.get('/users/:user/:userid/:tweetid?', function(req, res, next) {
	var	params = req.params.tweetid ? { where: { id: req.params.tweetid } } : {};
	var responseJSON = {}
	User.findById(req.params.userid).then(function(user) {
		var parsedUser = JSON.parse(JSON.stringify(user));
		responseJSON.user = parsedUser;
    	return user.getTweets(params);
	}).then(function(tweets) {
		console.log(JSON.stringify(tweets));
        var parsedTweets = JSON.parse(JSON.stringify(tweets));
        responseJSON.tweets = parsedTweets;
        res.render("profile", responseJSON);
  	}).catch(function(error){
  		console.log("USER ERROR", error);
  		res.sendStatus(404);
  	});
});


// example without static file server
// router.get('/style.css', function(req, res) {
//   fs.readFile('./public/style.css', function(err, contentBuffer) {
//     var css = contentBuffer.toString()
//     res.header('Content-Type', 'text/css')
//     res.send(css)
//   })
// })





