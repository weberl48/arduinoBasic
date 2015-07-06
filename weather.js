module.exports = function(zip, hour, min) {
    var express = require("express");
    var five = require("johnny-five");
    var request = require("request");
    var schedule = require('node-schedule');
    var db = require('monk')(process.env.MONGOLAB_URI);
    var weatherCollection = db.get('weather');
    var temp = "F";
    var board = new five.Board();
    hour = hour;
    min = min;
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
        var state = 0;
        console.log("Board Ready");
        var button = new five.Button({

            pin: 7,
            holdtime: 2000,
            invert: false
        });
        var lbutton = new five.Button({

            pin: 8,
            holdtime: 2000,
            invert: false
        });


        var piezo = new five.Piezo(9);



        console.log("Board Ready");
        lcd = new five.LCD({
            pins: [12, 11, 5, 4, 3, 2],
            rows: rows,
            cols: cols
        });
        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = new schedule.Range(0, 6);

        rule.hour = Number(hour);

        rule.minute = Number(min);

        var j = schedule.scheduleJob(rule, function() {


            alarm();

            function alarm() {
                piezo.play({
                    song: [
                        [698, 100], // Play frequency 698 for 1 beat
                        // ...
                    ]
                });

                button.on("press", function() {
                    piezo.noTone(9);
                    console.log('Alarm Off');
                    getWeather();
                });


            }

            function getWeather() {
                console.log("Generating Weather Report");
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
            }
        });

        //allows us to access functions within node
        //sending request data to screen formated for output
        function toScreen(city, temp, minTemp, maxTemp, conditions) {
            // city=city;
            // temp=temp;
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


            buttons(city, temp, minTemp, maxTemp, conditions);
        }




        function buttons(city, temp, minTemp, maxTemp, conditions) {


            console.log(city);

            board.repl.inject({
                button: button
            });

            lbutton.on("press", function() {
                lcd.clear().print("Save Data?");
            });
            lbutton.on("hold", function() {
                weatherCollection.insert({
                    city: city,
                    temp: temp,
                    minTemp: minTemp,
                    maxTemp: maxTemp,
                    conditions: conditions,
                    date: Date()
                });
                lcd.clear().print("Saved");
                lcd.clear();
                lcd.print(city);
                lcd.setCursor(cols - 4, 0).print(temp).setCursor(cols - 2, 0).print(":degree:" + "F");
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
                lcd.setCursor(cols - 4, 0).print(temp).setCursor(cols - 2, 0).print(":degree:" + "F");
            });
        }

    });

};
