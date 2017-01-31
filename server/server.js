const SERVER_PORT_NUMBER = process.env.PORT || 8080
const APPID = "c200d66e223bd37f3faa3aca4cb7f9ab"
var WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/";
var CURRENT_WEATHER_API_URL = WEATHER_API_URL + "weather?APPID=" + APPID + "&units=imperial";
var FORECAST_WEATHER_API_URL = WEATHER_API_URL + "forecast/?APPID=" + APPID + "&units=imperial";

const express = require('express')
const apiResponse = require('./api_response')

app= express()
app.use(express.static('public'))
app.get('/api/current-weather/', apiResponse.currentWeatherResponse) 
app.get('/api/forecast-weather/', apiResponse.forecastWeatherResponse)
app.listen(SERVER_PORT_NUMBER, function(){
  console.log('server is listening in on ' + SERVER_PORT_NUMBER)
});