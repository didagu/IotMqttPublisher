var mqtt = require('mqtt');
var properties = require('properties');

var deviceId = null;
var apiKey = null;
var apiToken = null;
var mqttHost = null;
var mqttPort = null;
var mqttclient = null;

function Connection() {
  this.connected = false;
}
// class methods

Connection.prototype.connect = function() {
	
	if (this.connected) {
	    if (global.clientlog) {
		  global.clientlog.write("already connected");
		  return;
	    }
	}
	
	var self = this;
	var iotSvcName = 'iotf-service';

	var instanceId = undefined;
	var iotService = undefined;
	
	if (process.env.VCAP_SERVICES) {
		var services = JSON.parse(process.env.VCAP_SERVICES);
		for (var svcName in services) {
	      if (svcName.match(iotSvcName)) {
	    	  iotService = services[svcName][0];
	    	  instanceId = "bluemix";
	      }
		}
	}

	if(instanceId && iotService) {
	  console.log('Instance Id: ' + instanceId);
	  deviceId = instanceId;
	  mqttHost = iotService.credentials.mqtt_host;
	  mqttPort = iotService.credentials.mqtt_s_port;
	  apiKey = iotService.credentials.apiKey;
	  apiToken = iotService.credentials.apiToken;
	  
	  self.createClient();
	  
	} else {
	  properties.parse('./config.properties', {path: true}, function(err, cfg) {
	    if (err) {
	      console.error('A file named config.properties containing the device registration from the IBM IoT Cloud is missing.');
	      console.error('The file must contain the following properties: apikey and apitoken.');
	      throw e;
	    }
	    
	    var org = cfg.apikey.split('-')[1];
		deviceId = "0815";
		mqttHost = org + '.messaging.internetofthings.ibmcloud.com';
		mqttPort = 8883;
		apiKey = cfg.apikey;
		apiToken = cfg.apitoken;
		
		self.createClient();
	  });
	};
};

Connection.prototype.createClient = function() {
	var self = this;
	var org = apiKey.split('-')[1];
	var clientId = ['a', org, deviceId].join(':');
	mqttclient = mqtt.connect("mqtts://" + mqttHost + ":" + mqttPort, {
	              "clientId" : clientId,
	              "keepalive" : 30,
	              "username" : apiKey,
	              "password" : apiToken
	            });
	
	mqttclient.on('connect', function() {
	    console.log('MQTT client connected to IBM IoT Cloud.');
	    if (global.clientlog)
	      global.clientlog.write("MQTT client connected to IBM IoT Cloud.");
	    self.connected = true;
	});
	mqttclient.on('error', function(err) {
	    console.error('client error' + err);
	    if (global.clientlog)
	      global.clientlog.write('client error' + err);
	});
	mqttclient.on('close', function() {
	    console.log('client closed');
	    self.connected = false;
	    if (global.clientlog)
	      global.clientlog.write('client closed');
    });
};

Connection.prototype.publish = function(data) {
	
    if (data == undefined) {
    	global.clientlog.write("no data sent");
    	return;
    }
	
	if (!data.deviceType ||
		!data.deviceId ||
		!data.command ||
		!data.args) {
		
		global.clientlog.write("all fields are required");
		return;
	}
	if (this.connected != true) {
		global.clientlog.write("not connected");
		return;
	}
	
	global.clientlog.write(JSON.stringify(data));
	
	payload = {d: {args: "args"}};
	payload.d.args = data.args;
	
	var topic = "iot-2/type/" + data.deviceType + "/id/" + data.deviceId +
	             "/cmd/" + data.command + "/fmt/json";
	mqttclient.publish(topic, JSON.stringify(payload), function (err) {
	  if (err) {
		  global.clientlog.write("error sending command:");
		  global.clientlog.write(err);
	  } else {
		  global.clientlog.write("successfully send command");
	  }
	});

};
	
Connection.prototype.test = function() {
  console.log(this.org);

  global.clientlog.write("trying to send command");	  
};

// export the class
module.exports = Connection;