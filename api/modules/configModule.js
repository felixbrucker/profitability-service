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
			scryptnf:{conversionFactor:3}, //untested
			x11:{conversionFactor:3},
			x13:{conversionFactor:3},
			keccak:{conversionFactor:3},
			x15:{conversionFactor:3},
			nist5:{conversionFactor:3},
			neoscrypt:{conversionFactor:3},
			lyra2re:{conversionFactor:3},
			whirlpoolx:{conversionFactor:3}, //untested
			qubit:{conversionFactor:3},
			quark:{conversionFactor:3},
			axiom:{conversionFactor:1}, //untested
			lyra2rev2:{conversionFactor:3},
			scryptjanenf16:{conversionFactor:3}, //untested
			blake256r8:{conversionFactor:3},
			blake256r14:{conversionFactor:3},
			blake256r8vnl:{conversionFactor:3},
			hodl:{conversionFactor:3},
			daggerhashimoto:{conversionFactor:3},
			decred:{conversionFactor:3},
			cryptonight:{conversionFactor:3},
			lbry:{conversionFactor:3},
			equihash:{conversionFactor:3}
		}
	  }
  },
  algos: {
    argon2:{profitability:0,pool:"", port: null},
	blake2s:{profitability:0,pool:"", port: null},
	blake256r8:{profitability:0,pool:"", port: null},
	c11:{profitability:0,pool:"", port: null},
	decred:{profitability:0,pool:"", port: null},
	lbry:{profitability:0,pool:"", port: null},
	lyra2rev2:{profitability:0,pool:"", port: null},
	m7m:{profitability:0,pool:"", port: null},
	"myr-gr":{profitability:0,pool:"", port: null},
	neoscrypt:{profitability:0,pool:"", port: null},
	nist5:{profitability:0,pool:"", port: null},
	qubit:{profitability:0,pool:"", port: null},
	quark:{profitability:0,pool:"", port: null},
	scrypt:{profitability:0,pool:"", port: null},
	sha256:{profitability:0,pool:"", port: null},
	sib:{profitability:0,pool:"", port: null},
	skein:{profitability:0,pool:"", port: null},
	veltor:{profitability:0,pool:"", port: null},
	x11:{profitability:0,pool:"", port: null},
	x11evo:{profitability:0,pool:"", port: null},
	x13:{profitability:0,pool:"", port: null},
	x14:{profitability:0,pool:"", port: null},
	x15:{profitability:0,pool:"", port: null},
	x17:{profitability:0,pool:"", port: null},
	yescrypt:{profitability:0,pool:"", port: null},
	scryptnf:{profitability:0,pool:"", port: null},
	keccak:{profitability:0,pool:"", port: null},
	lyra2re:{profitability:0,pool:"", port: null},
	whirlpoolx:{profitability:0,pool:"", port: null},
	axiom:{profitability:0,pool:"", port: null},
	scryptjanenf16:{profitability:0,pool:"", port: null},
	blake256r14:{profitability:0,pool:"", port: null},
	blake256r8vnl:{profitability:0,pool:"", port: null},
	hodl:{profitability:0,pool:"", port: null},
	daggerhashimoto:{profitability:0,pool:"", port: null},
	cryptonight:{profitability:0,pool:"", port: null},
	equihash:{profitability:0,pool:"", port: null}
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
