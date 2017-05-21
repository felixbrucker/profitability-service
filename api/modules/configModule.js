'use strict';

var colors = require('colors/safe');
var fs = require('fs');

var configPath="data/settings.json";

if (!fs.existsSync("data")){
  fs.mkdirSync("data");
}
var config = module.exports = {
  config: {
	enabled: {
		nicehash: true
	},
	tresholdZpool: 0.00003,
	prevAmountZpool: 3
  },
  pools:{
	  nicehash:{
		  baseUrl: "stratum+tcp://#ALGO#.#REGION#.nicehash.com:#PORT#",
		  regions: ["eu","usa","hk","jp"],
		  algos: {
				scrypt:{conversionFactor:3},
				sha256:{conversionFactor:3},
				x11:{conversionFactor:3},
				x13:{conversionFactor:3},
				x15:{conversionFactor:3},
				nist5:{conversionFactor:3},
				neoscrypt:{conversionFactor:3},
				lyra2re:{conversionFactor:3},
				qubit:{conversionFactor:3},
				quark:{conversionFactor:3},
				lyra2rev2:{conversionFactor:3},
				daggerhashimoto:{conversionFactor:3},
				decred:{conversionFactor:3},
				cryptonight:{conversionFactor:3},
				lbry:{conversionFactor:3},
				equihash:{conversionFactor:3},
				pascal:{conversionFactor:3}, //untested
				x11gost:{conversionFactor:3},
				sia:{conversionFactor:3}
			}
	  }
  },
  algos: {
		decred:{profitability:0,pool:"", port: null},
		lbry:{profitability:0,pool:"", port: null},
		lyra2rev2:{profitability:0,pool:"", port: null},
		neoscrypt:{profitability:0,pool:"", port: null},
		nist5:{profitability:0,pool:"", port: null},
		qubit:{profitability:0,pool:"", port: null},
		quark:{profitability:0,pool:"", port: null},
		scrypt:{profitability:0,pool:"", port: null},
		sha256:{profitability:0,pool:"", port: null},
		x11:{profitability:0,pool:"", port: null},
		x13:{profitability:0,pool:"", port: null},
		x15:{profitability:0,pool:"", port: null},
		lyra2re:{profitability:0,pool:"", port: null},
		daggerhashimoto:{profitability:0,pool:"", port: null},
		cryptonight:{profitability:0,pool:"", port: null},
		equihash:{profitability:0,pool:"", port: null},
		pascal:{profitability:0,pool:"",port: null},
		x11gost:{profitability:0,pool:"",port: null},
		sia:{profitability:0, pool: "", port: null}
  },
  logs: [],
  getConfig: function () {
    return config.config;
  },
  setConfig: function (newConfig) {
    config.config = newConfig;
  },
  saveConfig: function () {
    console.log(colors.grey("writing config to file.."));
    fs.writeFile(configPath, JSON.stringify(config.config), function (err) {
      if (err) {
        return console.log(err);
      }
    });
  },
  loadConfig: function () {
    fs.stat(configPath, function (err, stat) {
      if (err == null) {
        fs.readFile(configPath, 'utf8', function (err, data) {
          if (err) throw err;
          config.config = JSON.parse(data);
        });
      } else if (err.code == 'ENOENT') {
        //default conf
        config.saveConfig();
      }
    });
  }
};
console.log("initializing, please wait...");
config.loadConfig();
