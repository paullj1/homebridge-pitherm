
var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-pitherm", "Thermostat", Thermostat);
};


function Thermostat(log, config) {
  this.log = log;
  this.maxTemp = config.maxTemp || 90;
  this.minTemp = config.minTemp || 50;
  this.name = config.name;
  this.apiroute = config.apiroute || "apiroute";
  this.log(this.name, this.apiroute);
  this.username = config.username || null;
  this.password = config.password || null;
  
  if(this.username != null && this.password != null){
    this.auth = {
      user : this.username,
      pass : this.password
    };
  }

  // Documented here: https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
  this.service = new Service.Thermostat(this.name);
  this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.FAHRENHEIT;

  this.currentTemperature = 71;
  this.targetTemperature = 71;
  this.currentHeatingCoolingState = Characteristic.CurrentHeatingCoolingState.OFF;
  this.targetHeatingCoolingState = Characteristic.TargetHeatingCoolingState.OFF;

}

Thermostat.prototype = {

  identify: function(callback) {
    this.log("Identify requested!");
    callback(null);
  },

  getCurrentHeatingCoolingState: function(callback) {
    this.log("getCurrentHeatingCoolingState from:", this.apiroute+"/status");
    request.get({
      url: this.apiroute+"/status",
      auth : this.auth
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        this.log("response success");
        var json = JSON.parse(body);
        this.log("currentHeatingCoolingState is %s", json.currentHeatingCoolingState);
        this.currentHeatingCoolingState = json.currentHeatingCoolingState;

        // Apparently must be forced 
        this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, this.currentHeatingCoolingState);
        
        callback(null, this.currentHeatingCoolingState); // success
      } else {
        this.log("Error getting CurrentHeatingCoolingState: %s", err);
        callback(err);
      }
    }.bind(this));
  },

  getTargetHeatingCoolingState: function(callback) {
    this.log("getTargetHeatingCoolingState from:", this.apiroute+"/status");
    request.get({
      url: this.apiroute+"/status",
      auth : this.auth
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        this.log("response success");
        var json = JSON.parse(body);
        this.log("TargetHeatingCoolingState received is %s", json.targetHeatingCoolingState);
        this.targetHeatingCoolingState = json.targetHeatingCoolingState;
        
        callback(null, this.targetHeatingCoolingState); // success
      } else {
        this.log("Error getting TargetHeatingCoolingState: %s", err);
        callback(err);
      }
    }.bind(this));
  },

  setTargetHeatingCoolingState: function(value, callback) {
    if(value === undefined) {
      callback(); //was called without value; process the rest
    } else {
      this.log("setTargetHeatingCoolingState from/to:", this.targetHeatingCoolingState, value);
      
      var action;

      switch(value) {
        case Characteristic.TargetHeatingCoolingState.OFF:
        action = "/0";
        break;

        case Characteristic.TargetHeatingCoolingState.HEAT:
        action = "/1";
        break;
        
        case Characteristic.TargetHeatingCoolingState.COOL:
        action = "/2";
        break;
        
        default:
        action = "/0";
        this.log("Not handled case:", value);
        break;
      }
      
      request.get({
        url: this.apiroute + '/targetHeatingCoolingState/' + action,
        auth : this.auth
      }, function(err, response, body) {
        if (!err && response.statusCode == 200) {
          this.log("response success");
          this.targetHeatingCoolingState = value;
          callback(null, this.targetHeatingCoolingState); // success
        } else {
          this.log("Error getting state: %s", err);
          callback(err);
        }
      }.bind(this));
    }
  },

  getCurrentTemperature: function(callback) {
    this.log("getCurrentTemperature from:", this.apiroute+"/status");
    request.get({
      url: this.apiroute+"/status",
      auth : this.auth
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        this.log("response success");
        var json = JSON.parse(body);
        this.log("CurrentTemperature %s", json.currentTemperature);
        this.currentTemperature = parseFloat(json.currentTemperature);
        callback(null, this.currentTemperature); // success
      } else {
        this.log("Error getting state: %s", err);
        callback(err);
      }
    }.bind(this));
  },

  getTargetTemperature: function(callback) {
    this.log("getTargetTemperature from:", this.apiroute+"/status");
    request.get({
      url: this.apiroute+"/status",
      auth : this.auth
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        this.log("response success");
        var json = JSON.parse(body); 
        this.log("TargetTemperature is %s", json.targetTemperature);
        this.targetTemperature = parseFloat(json.targetTemperature);
        callback(null, this.targetTemperature); // success
      } else {
        this.log("Error getting state: %s", err);
        callback(err);
      }
    }.bind(this));
  },

  setTargetTemperature: function(value, callback) {
    this.log("setTargetTemperature from:", this.apiroute+"/targetTemperature/"+value);
    request.get({
      url: this.apiroute+"/targetTemperature/"+value,
      auth : this.auth
    }, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        this.log("response success");
        this.targetTemperature = parseFloat(value);
        callback(null, this.targetTemperature); // success
      } else {
        this.log("Error getting state: %s", err);
        callback(err);
      }
    }.bind(this));
  },

  getTemperatureDisplayUnits: function(callback) {
    this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
    callback(null, this.temperatureDisplayUnits);
  },

  setTemperatureDisplayUnits: function(value, callback) {
    this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
    this.temperatureDisplayUnits = value;
    callback(null, this.temperatureDisplayUnits); // success
  },
  getName: function(callback) {
    this.log("getName :", this.name);
    callback(null, this.name);
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "PiTherm")
      .setCharacteristic(Characteristic.Model, "All in One")
      .setCharacteristic(Characteristic.SerialNumber, "1337");

    // Required Characteristics
    this.service
      .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
      .on('get', this.getCurrentHeatingCoolingState.bind(this));

    this.service
      .getCharacteristic(Characteristic.TargetHeatingCoolingState)
      .on('get', this.getTargetHeatingCoolingState.bind(this))
      .on('set', this.setTargetHeatingCoolingState.bind(this));

    this.service
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getCurrentTemperature.bind(this));

    this.service
      .getCharacteristic(Characteristic.TargetTemperature)
      .on('get', this.getTargetTemperature.bind(this))
      .on('set', this.setTargetTemperature.bind(this));

    this.service
      .getCharacteristic(Characteristic.TemperatureDisplayUnits)
      .on('get', this.getTemperatureDisplayUnits.bind(this))
      .on('set', this.setTemperatureDisplayUnits.bind(this));

    this.service
      .getCharacteristic(Characteristic.Name)
      .on('get', this.getName.bind(this));
    this.service.getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({
        minValue: this.minTemp,
        maxValue: this.maxTemp,
        minStep: 1
      });
    this.service.getCharacteristic(Characteristic.TargetTemperature)
      .setProps({
        minValue: this.minTemp,
        maxValue: this.maxTemp,
        minStep: 1
      });
    this.log(this.minTemp);
    return [informationService, this.service];
  }
};
