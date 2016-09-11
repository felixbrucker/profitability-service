'use strict';

const https = require('https');
const http = require('http');
var fs = require('fs');
var colors = require('colors/safe');

var configModule = require(__basedir + 'api/modules/configModule');


function query(req, res, next) {
  if (req.body.algos!==undefined&&req.body.region!==undefined){
	  var bestAlgo="";
	  var bestProfitability=0;
	  Object.keys(req.body.algos).forEach(function (key) {
		  if (req.body.algos[key].hashrate !== undefined && key in configModule.algos)
			  if (req.body.algos[key].hashrate * configModule.algos[key].profitability > bestProfitability){
				  bestProfitability=req.body.algos[key].hashrate * configModule.algos[key].profitability;
				  bestAlgo=key;
			  }
	  });
	  if (bestAlgo!==""){
		var result=configModule.pools[configModule.algos[bestAlgo].pool].baseUrl;
		result = result.replace("#ALGO#", bestAlgo);
		if (configModule.pools[configModule.algos[bestAlgo].pool].regions!==null)
			result = result.replace("#REGION#", req.body.region);
		result = result.replace("#PORT#", configModule.algos[bestAlgo].port);
		if (req.body.name!==undefined){
			if (configModule.logs.length===20)
				configModule.logs.pop();
			var date=new Date().toJSON();
			configModule.logs.unshift("["+date.slice(0,10)+" "+date.slice(11,19)+"] "+req.body.name+" got "+bestAlgo+" on "+configModule.algos[bestAlgo].pool+" with "+bestProfitability.toFixed(8)+" BTC/Day");
		}
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({result: {url:result,profitability:configModule.algos[bestAlgo].profitability,pool:configModule.algos[bestAlgo].pool,algo:bestAlgo}}));
		res.end();
	  }
  }else{
	if (configModule.logs.length===20)
		configModule.logs.pop();
	var date=new Date().toJSON();
	configModule.logs.unshift("["+date.slice(0,10)+" "+date.slice(11,19)+"] failed query with following body: "+req.body);
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({result: false}));
	res.end();
  }
}



function getProfitability(pool) {
	var host= "";
	var path= "";
	switch(pool){
		case "nicehash":
			host="www.nicehash.com";
			path="/api?method=simplemultialgo.info";
			break;
		case "zpool":
			host="www.zpool.ca";
			path="/api/status";
			break;
	}
  return https.get({
    host: host,
    path: path
  }, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var parsed = null;
      try{
        parsed=JSON.parse(body);
      }catch(error){
        console.log("Error: Unable to get "+pool+" profitability data, retrying in 5 sec...");
        console.log(error);
		setTimeout(function(){
			getProfitability(pool);
		},5000);
      }
      if (parsed != null){
		switch (pool){
			case "nicehash":
				Object.keys(parsed.result.simplemultialgo).forEach(function (key) {
					if (parsed.result.simplemultialgo[key].algo!==999) //skip ethereum, daggerhashimoto replaced it
						setRealProfitability(parsed.result.simplemultialgo[key].name,parsed.result.simplemultialgo[key].paying,pool,parsed.result.simplemultialgo[key].port);
				});
				break;
			case "zpool":
				Object.keys(parsed).forEach(function (key) {
					setRealProfitability(parsed[key].name,parsed[key].estimate_current,pool,parsed[key].port);
				});
				break;
		}
      }
    });
  }).on("error", function(error) {
    console.log("Error: Unable to get "+pool+" profitability data, retrying in 5 sec...");
    console.log(error);
	setTimeout(function(){
		getProfitability(pool);
	},5000);
  });
}


function setRealProfitability(key,profitability,pool,port){
	var newKey=key;
	if (configModule.pools[pool].algos[key].alt!==undefined)
		newKey=configModule.pools[pool].algos[key].alt;
	var newProfitability=0;
	switch(configModule.pools[pool].algos[key].conversionFactor){
		case 0: newProfitability=profitability;
		  break;
		case 1: newProfitability=profitability/1000;
		  break;
		case 2: newProfitability=profitability/1000000;
		  break;
		case 3: newProfitability=profitability/1000000000;
		  break;
		case 4: newProfitability=profitability/1000000000000;
		  break;
		case 5: newProfitability=profitability/1000000000000000;
		  break;
	}
	if (configModule.algos[newKey].profitability<newProfitability){
		configModule.algos[newKey].profitability=newProfitability;
		configModule.algos[newKey].pool=pool;
		configModule.algos[newKey].port=port;
	}
}



function init() {
	if (configModule.config.enabled.nicehash)
		getProfitability("nicehash");
	if (configModule.config.enabled.zpool)
		getProfitability("zpool");
	
	var minutes = 3, profitabilityInterval = minutes * 60 * 1000;
	setInterval(function () {
		if (configModule.config.enabled.nicehash)
			getProfitability("nicehash");
		if (configModule.config.enabled.zpool)
			getProfitability("zpool");
	}, profitabilityInterval);
}

setTimeout(init, 1000);

exports.query = query;

