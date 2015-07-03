var express = require('express');
var router = express.Router();
var weather = require("../weather");
var unirest = require("unirest");
var request = require('request');

/* GET home page. */
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
//get weather data
router.post('/weather', function(req, res, next) {
  var zip = req.body.zip;
  // console.log(zip);
  weather(zip);
  
  console.log(weather(zip));
  res.redirect('/');
});


router.post('/contact/email', function(req, res, next) {
  var locals = validate.contact(req.body);

  if (locals.errors.length > 0){
    res.render('contact', locals);
  } else{
  peopleCollection.insert({peopleName: req.body.peopleName,  hobby: req.body.hobby });
  res.redirect('/people/show');}
});
module.exports = router;
