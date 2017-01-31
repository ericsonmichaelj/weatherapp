const APPID = "c200d66e223bd37f3faa3aca4cb7f9ab"
var WEATHER_API_URL = "http://api.openweathermap.org/data/2.5/";
var CURRENT_WEATHER_API_URL = WEATHER_API_URL + "weather?APPID=" + APPID + "&units=imperial";
var FORECAST_WEATHER_API_URL = WEATHER_API_URL + "forecast/?APPID=" + APPID + "&units=imperial";
const request = require('request')

function fetchAPI(API, req, resp) {
  request(API + '&lat=' + req.query.lat + '&lon=' + req.query.lon,
  function(error, response, body) {
    if (!error && response.statusCode === 200) {
      resp.send(body)
    } else {
      resp.status(500).send('Error could not retrieve info from weather api')
    }
  })
}

var currentWeatherResponse = function(req, resp) {
  fetchAPI(CURRENT_WEATHER_API_URL, req, resp)
}
var forecastWeatherResponse = function(req, resp) {
  fetchAPI(FORECAST_WEATHER_API_URL, req, resp)
} 

module.exports = {
  currentWeatherResponse: currentWeatherResponse,
  forecastWeatherResponse: forecastWeatherResponse
}