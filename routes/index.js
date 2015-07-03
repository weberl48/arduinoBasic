var express = require('express');
var router = express.Router();
var weather = require("../weather");
var unirest = require("unirest");
var request = require('request');

var nodemailer = require("nodemailer");
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/weather');
var mg = require('nodemailer-mailgun-transport');
var weatherCollection = db.get('weather');
/* GET home page. */
router.get('/data', function(req, res, next) {
  weatherCollection.find({}, function (err, records) { //find all records
  res.render('data', {title:"Weather Data", weather: records });//render all records on albums/index
});
});
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
/* GET about page. */
router.get("/about", function (req,res,next) {
  res.render("about", {title:'About'});
});
/* GET contact page. */
router.get("/contact", function (req, res, next) {
  res.render("contact", {title:"Contact"});
});
/* GET data page. */
router.get("/data", function (req, res, next) {
  res.render("data", {title:"Contact"});
});
//get weather data
router.post('/weather', function(req, res, next) {
  var zip = req.body.zip;
  // console.log(zip);
  weather(zip);
  res.redirect('/');
});


router.post('/contact' , function (req,res,next) {
  var auth = {
  auth: {
    api_key: 'key-6f9d35268e740f4a0fddaab4efce54a9',
    domain: 'smtp.mailgun.org'
  }
};
var nodemailerMailgun = nodemailer.createTransport(mg(auth));

nodemailerMailgun.sendMail({
  from: req.body.email,
  to: 'weberle48@outlook.com', // An array if you have multiple recipients.
  subject: req.body.subject,
  'h:Reply-To': 'reply2this@company.com',
  //You can use "text:" to send plain-text content. It's oldschool!
  text: req.body.body
}, function (err, info) {
  if (err) {
    console.log('Error: ' + err);
  }
  else {
    console.log('Response: ' + info);
  }
});
});


module.exports = router;
