var express = require('express');
var router = express.Router();
var weather = require("../lib/javascript/weather.js");
var unirest = require("unirest");
var request = require('request');
var validate = require('../public/javascripts/logic.js');
var timeInput = require('../public/javascripts/indexLogic.js');

var nodemailer = require("nodemailer");
var sendgrid = require('sendgrid')(process.env.api_user, process.env.api_key);
var db = require('monk')(process.env.MONGOLAB_URI );

var weatherCollection = db.get('weather');
/* GET home page. */
router.get('/data', function(req, res, next) {
    weatherCollection.find({}, function(err, records) { //find all records
        res.render('data', {
            title: "Weather Data",
            weather: records
        }); //render all records on albums/index
    });
});
router.get('/', function(req, res, next) {
    res.render('index');
});
/* GET about page. */
router.get("/about", function(req, res, next) {
    res.render("about", {
        title: 'About'
    });
});
/* GET contact page. */
router.get("/contact", function(req, res, next) {
    res.render("contact", {
        title: "Contact"
    });
});
/* GET data page. */
router.get("/data", function(req, res, next) {
    res.render("data", {
        title: "Contact"
    });
});
//get weather data
router.post('/weather', function(req, res, next) {

    var locals = timeInput(req.body);
    var hour = locals[0];
    var min = locals[1];
    var zip = req.body.zip;
    console.log(hour);


    console.log(hour);
    weather(zip, hour, min);

    res.render('index', {
        title: "Check Arduino LCD for weather data"
    });

});


router.post('/contact', function(req, res, next) {
    var locals = validate(req.body);
    if (locals.errors.length > 0) {
        res.render('contact', error);
    } else {
        sendgrid.send({
            to: 'weberl48@outlook.com',
            from: req.body.email.trim(),
            subject: req.body.subject,
            text: req.body.body
        }, function(err, json) {
            if (err) {
            return console.error(err);
            }
            console.log(json);
        });
        res.render('contact', {
            message: "Email Sent Thank You"
        });
    }
});


module.exports = router;
