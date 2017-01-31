$(function() {
  'use strict';
  var APPID = "c200d66e223bd37f3faa3aca4cb7f9ab";
  var WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/";
  var CURRENT_WEATHER_API_URL = WEATHER_API_URL + "weather?APPID=" + APPID + "&units=imperial";
  var FORECAST_WEATHER_API_URL = WEATHER_API_URL + "forecast/?APPID=" + APPID + "&units=imperial";
  var UPDATE_FREQUENCY = 1000 * 60 * 60;
  var DAYS_ENUM = {
    "0": "Sunday",
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
  };
  var WeatherAverageCalculator = function(date) {
    this.date = new Date(date * 1000);
    this.totalCount = 0;
    this.totalTemperature = 0;
    this.mainIcons = {};
    this.mainWeathers = {};
    this.totalPressure = 0;
    this.totalHumidity = 0;
    this.totalWindSpeed = 0;
    this.totalClouds = 0;
  };
  WeatherAverageCalculator.prototype.update = function(data) {
    this.totalCount++;
    this.totalTemperature += data.main.temp;
    this.totalPressure += data.main.pressure;
    this.totalHumidity += data.main.humidity;
    this.totalWindSpeed += data.wind.speed;
    this.totalClouds += data.clouds.all;
    if(this.mainIcons[data.weather[0].icon]) {
      this.mainIcons[data.weather[0].icon]++;
    } else {
      this.mainIcons[data.weather[0].icon] = 1;
    }
     if(this.mainWeathers[data.weather[0].main]) {
      this.mainWeathers[data.weather[0].main]++;
    } else {
      this.mainWeathers[data.weather[0].main] = 1;
    }
  };
  WeatherAverageCalculator.prototype.getAverageResults = function() {
    var data = {weather: [{main: null, icon: null}],
      dt: this.date.getTime() / 1000,
      wind: { speed: null },
      clouds: { all: null },
      humidity: null,
      pressure: null,
      main: {temp: null, pressure: null, humidity: null}
    };
    data.wind.speed = +(this.totalWindSpeed / this.totalCount).toFixed(2);
    data.main.temp = +(this.totalTemperature / this.totalCount).toFixed(2);
    data.main.pressure = +(this.totalPressure / this.totalCount).toFixed(0);
    data.main.humidity = +(this.totalHumidity / this.totalCount).toFixed(0);
    data.wind.speed = +(this.totalWindSpeed / this.totalCount).toFixed(2);
    data.clouds.all = +(this.totalClouds / this.totalCount).toFixed(0);
    var maxNumberOfIcons = 0;
    var maxNumberOfMainWeather = 0;
    for (var icon in this.mainIcons) {
      if (maxNumberOfIcons < this.mainIcons[icon]) {
        data.weather[0].icon = icon;
        maxNumberOfIcons = this.mainIcons[icon];
      }
    }
    for (var weather in this.mainWeathers) {
      if (maxNumberOfMainWeather < this.mainWeathers[weather]) {
        data.weather[0].main = weather;
        maxNumberOfMainWeather = this.mainWeathers[weather];
      }
    }
    return data;
  };
  var getDay = function(date, currentDate) {
    if (date.getDay() === currentDate.getDay()) {
      return "Today";
    } else {
      return DAYS_ENUM[date.getDay()];
    }
  };

  var App = {
    init: function() {
      this.renderLoader();
      this.currentWeather = null;
      this.weatherForecast = null;
      this.currentWeatherInterval = null;
      this.weatherForecastInterval = null;
      this.lastCurrentWeatherUpdate = null;
      this.lastWeatherForecastUpdate = null;
      this.longitude = null;
      this.latitude = null;
      var that = this;
      navigator.geolocation.getCurrentPosition(function(position) {
        that.addEventListeners();
        console.log(position.coords.latitude)
        that.latitude = position.coords.latitude;
        that.longitude = position.coords.longitude;
        that.changePageToCurrentWeather();
      }, that.renderNavigatorMessage.bind(that));

    },
    addEventListeners: function() {
      var that = this;
      document.getElementById('current-weather').addEventListener('click', that.changePageToCurrentWeather.bind(that));
      document.getElementById('five-day-forecast').addEventListener('click', that.changePageToForecastWeather.bind(that));      
    },
    fetch: function(url, callback) {
      this.renderLoader();
      $.get({
        url: url,
        dataType: 'json',
        success: callback.bind(this),
        error: this.renderErrorMessage.bind(this)
      });
    },
    fetchCurrentWeather: function() {
      this.fetch(CURRENT_WEATHER_API_URL + '&lat=' + this.latitude + '&lon=' + this.longitude,
        this.updateCurrentWeather);
      },
    fetchForecastWeather: function() {
      this.fetch(FORECAST_WEATHER_API_URL + '&lat=' + this.latitude + '&lon=' + this.longitude,
        this.updateForecastWeather);
      },
    renderCurrentWeather: function() {
      if(!this.onCurrentWeatherPage()) {
        $('#five-day-forecast').removeClass('hide'); 
      }
      this.getAppId().innerHTML = this.createWeatherPanel(this.currentWeather, this.lastCurrentWeatherUpdate);
    },
    renderForecastWeather: function() {
      if(!this.onFiveDayForecastPage) {
        $('#current-weather').removeClass('hide'); 
      }
      var weatherForecasts = this.weatherForecast.list;
      var weatherPanels = [];
      var weatherAverageCalculator = new WeatherAverageCalculator(weatherForecasts[0].dt);
      for (var i = 0; i < weatherForecasts.length; i++) {
        var weatherForecast = weatherForecasts[i];
        if(getDay(weatherAverageCalculator.date, this.lastWeatherForecastUpdate) === getDay(new Date(weatherForecast.dt * 1000), this.lastWeatherForecastUpdate)) {
          weatherAverageCalculator.update(weatherForecast);
        } else {
          weatherPanels.push(this.createWeatherPanel(weatherAverageCalculator.getAverageResults(), this.lastWeatherForecastUpdate));
          weatherAverageCalculator = new WeatherAverageCalculator(weatherForecast.dt);
        }
      }
      this.getAppId().innerHTML = weatherPanels;
    },
    renderLoader: function() {
      this.getAppId().innerHTML = '<h3 class="loader-message">Loading Please wait...</h3><div class="loader"></div>';
    },
    renderErrorMessage: function() {
      this.getAppId().innerHTML = "<span class='error'>" + 
        "We're sorry but there was an error retrieving this information. " + "<br>" + 
        "Please contact ericson.michael.j@gmail.com for support or try again later." +
      "</span>";
    },
    renderNavigatorMessage: function() {
      this.getAppId().innerHTML = "<div class='navigator-message-container'><p class='navigator-message'>" +
      "Something went wrong in trying to detect your location. " +
      "Please check your web browser settings and" +
      " see if we have permission to know your location " +
      "or contact customer support at ericson.michael.j@gmail.com" + 
      "</p></div>";
    },
    updateCurrentWeather: function(currentWeather) {
      this.lastCurrentWeatherUpdate = new Date();
      this.currentWeather = currentWeather;
      this.renderCurrentWeather();
    },
    updateForecastWeather: function(forecastWeather) {
      this.lastWeatherForecastUpdate = new Date();
      this.weatherForecast = forecastWeather;
      this.renderForecastWeather();
    },
    changePageToCurrentWeather: function(){
      $('#current-weather').addClass('hide');
      this.clearForecastWeatherInterval();
      if (this.currentWeather === null || new Date() - this.lastCurrentWeatherUpdate > UPDATE_FREQUENCY) {
        this.fetchCurrentWeather();
      } else {
        this.renderCurrentWeather();
      }
      if (this.currentWeatherInterval === null) {
        this.fetchCurrentWeatherPeriodiocally();
      }
    },
    changePageToForecastWeather: function() {
      $('#five-day-forecast').addClass('hide');
      this.clearCurrentWeatherInterval();
      if (this.weatherForecast === null || new Date() - this.lastWeatherForcastUpdate > UPDATE_FREQUENCY) {
        this.fetchForecastWeather();
      } else {
        this.renderForecastWeather();
      }
      if(this.forecastWeatherInterval === null) {
        this.fetchForecastWeatherPeriodiocally();
      }
    },
    fetchCurrentWeatherPeriodiocally: function() {
      this.currentWeatherInterval = setInterval(this.fetchCurrentWeather.bind(this), UPDATE_FREQUENCY);
    },
    fetchForecastWeatherPeriodiocally: function() {
      this.forecastWeatherInterval = setInterval(this.fetchForecastWeather.bind(this), UPDATE_FREQUENCY);
    },
    clearForecastWeatherInterval: function() {
      clearInterval(this.forecastWeatherInterval);
      this.forecastWeatherInterval = null;
    },
    clearCurrentWeatherInterval: function() {
      clearInterval(this.currentWeatherInterval);
      this.currentWeatherInterval = null;
    },
    onCurrentWeatherPage: function() {
      return !$('#five-day-forecast').hasClass('hide');  
    },
    onFiveDayForcastPage: function() {
      return !$('#current-weather').hasClass('hide');
    },
    getAppId: function() {
      return document.getElementById('app');
    },
    createWeatherPanel: function(data, date) {
      return (
      "<div class='weather-panel'>" +
        "<div class='date'>" + getDay(new Date(data.dt * 1000), date) + "</div>" +
        "<h1 class='weather-main'>" + 
          data.weather[0].main + " - " + data.main.temp + '&#8457' + 
        "</h1>" + 
        "<img class=" + "'weather-image'" +
          "src='http://openweathermap.org/img/w/" + data.weather[0].icon + ".png'" +
        ">" +
        "<div class='weather-secondary'>" +
          "<div class='col-6'>" + 
            "<p> <span class='title'> Humidity: </span>" + data.main.humidity + "%" + "</p>" +
            "<p> <span class='title'> Pressure: </span>" + data.main.pressure + " hPa" + "</p>" +
          "</div>" + 
          "<div class='col-6'>" +
            "<p> <span class='title'> Winds: </span>" + data.wind.speed + " mph" + "</p>" +
            "<p> <span class='title'>Clouds: </span>" + data.clouds.all +  "%" + "</p>" +
          "</div>" +
        "</div>" + 
      "</div>"
      );
    }

  };
  App.init();
});