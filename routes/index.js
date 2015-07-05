var express = require('express');
var router = express.Router();
var weather = require("../weather");
var unirest = require("unirest");
var request = require('request');

var nodemailer = require("nodemailer");
  var sendgrid  = require('sendgrid')(process.env.api_user, process.env.api_key);
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/weather');

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
  res.render('index', {title: "Check LCD"});
});


router.post('/contact' , function (req,res,next) {

sendgrid.send({
  to:       'weberl48@outlook.com',
  from:     req.body.email.trim(),
  subject:  req.body.subject,
  text:     req.body.body
}, function(err, json) {
  if (err) { return console.error(err); }
  console.log(json);
});
res.render('contact', {message:"Email Sent Thank You"});
});


module.exports = router;
