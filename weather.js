module.exports = function(zip) {
    var express = require("express");
    var five = require("johnny-five");
    var request = require("request");
    var schedule = require('node-schedule');
    var db = require('monk')(process.env.MONGOLAB_URI);
    var weatherCollection = db.get('weather');
    var temp = "F";
    var board = new five.Board();
    var rows = 2;
    var cols = 16;
    var lcd;
    //temp conversion
    function kToF(tempK) {
        tempK = (tempK - 273.15) * 1.8000 + 32.00;
        return parseInt(tempK);
    }
    //when board is on do this function
    board.on('ready', function() {
        lcd = new five.LCD({
            pins: [12, 11, 5, 4, 3, 2],
            rows: rows,
            cols: cols
        });
        lcd.clear();
        lcd.print("Generating Weather Report");
        //api get pulling weather info based on zip code
        request("http://api.openweathermap.org/data/2.5/weather?zip=" + zip + ",us", function(error, response, body) {
            data = JSON.parse(body);
            var city = data.name;
            var temp = kToF(data.main.temp);
            var minTemp = kToF(data.main.temp_min);
            var maxTemp = kToF(data.main.temp_max);
            var conditions = data.weather[0].description;
            toScreen(city, temp, minTemp, maxTemp, conditions);
        });
    });
    // weatherCollection.insert({forcast: response.body, date: respnse.body.date }); //inserts user form data into mongo db album-demo.albumCollection
    //allows us to access functions within node
    //sending request data to screen formated for output
    function toScreen(city, temp, minTemp, maxTemp, conditions) {
        //first Row
        var degSymbol = [4, 10, 4, 0, 0, 0, 0]; //creating a custom degree symbol by assigning pixels
        lcd.createChar('degree', degSymbol); //making character a useable to arduino
        lcd.useChar('degree'); //telling arduino to use the character made
        lcd.clear().print(city); //display city name
        lcd.setCursor(cols - 4, 0).print(temp).setCursor(cols - 2, 0).print(":degree:" + "F");
        //second Row
        var secondLine = 0;
        var messages = 3;
        ///every 2 secs change second row display
        board.loop(2000, function() {
            lcd.setCursor(0, rows - 1).print("                ");
            switch (secondLine) {
                case 0:
                    lcd.setCursor(0, rows - 1).print(conditions);
                    break;
                case 1:
                    lcd.setCursor(0, rows - 1).print("High of " + maxTemp + ":degree:" + "F"); // Display high temperature
                    break;
                case 2:
                    lcd.setCursor(0, rows - 1).print("Low of " + minTemp + ":degree:" + "F"); // Display low temperature
                    break;
            }
            secondLine++;
            if (secondLine > messages - 1) {
                secondLine = 0;
            }
        });
        var button = new five.Button({
                board: board,
                pin: 7,
                holdtime: 2000,
                invert: false
            }
        );
        board.repl.inject({
            button: button
        });
        var lbutton = new five.Button(8);
        lbutton.on("press", function() {
            lcd.clear().print("Save Data?");
        });
        board.repl.inject({
            lbutton: lbutton
        });
        button.on("press", function() {
            weatherCollection.insert({
                city: city,
                temp: temp,
                minTemp: minTemp,
                maxTemp: maxTemp,
                conditions: conditions,
                date: Date()
            });
            lcd.clear().print("Saved");
        });
        button.on("hold", function() {
            lcd.clear();
            lcd.print(city);
        });
    }
};
