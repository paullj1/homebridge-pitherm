# Homebridge PiTherm
[Homebridge](https://github.com/nfarina/homebridge) plugin for the [PiTherm
Thermostat](https://github.com/paullj1/PiTherm).  This plugin is based on the
start that PJCzx started with the
[homebridge-thermostat](https://github.com/PJCzx/homebridge-thermostat) plugin.
That plugin had some bugs, issues, and inconsistencies.  This plugin corrects
those, and specifically adapts the plugin for
[PiTherm](https://github.com/paullj1/PiTherm).

## Config
Homebridge config should contain an accessory that looks something like this:
```
{
    "accessory": "Thermostat",
    "name": "Thermostat Demo",
    "apiroute": "http://myurl.com",
    //optional
    "maxTemp": "90",
    "minTemp": "50",
    "username": "user",
    "password": "pass"
}
```

Your API should provide the following:
* Get status of system:
  *  Request: `GET /status`
  *  Response:
     ```
     {
       currentTemperature: FLOAT_VALUE,
       targetTemperature: FLOAT_VALUE,
       currentHeatingCoolingState: INT_VALUE_0_TO_2,
       targetHeatingCoolingState: INT_VALUE_0_TO_3
     }
     ```

* Set Target HeatingCoolingState:
  * Request:  `GET /targetHeatingCoolingState/{INT_VALUE_0_TO_3}`
  * Response: `OK (200)`

* Set Target Temperature:
  * Request:  `GET /targetTemperature/{FLOAT_VALUE}`
  * Response: `OK (200)`

## Acknowledgments
* nfarina [homebridge](https://github.com/nfarina/homebridge)
* PJCzx - [homebridge-thermostat](https://github.com/PJCzx/homebridge-thermostat)

