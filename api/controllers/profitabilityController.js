'use strict';

const https = require('https');
const http = require('http');
var fs = require('fs');
var colors = require('colors/safe');

var configModule = require(__basedir + 'api/modules/configModule');

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

function query(req, res, next) {
  if (req.body.algos!==undefined&&req.body.region!==undefined){
	  var bestAlgo="";
	  var bestProfitability=0;
	  //console.log("======= "+req.body.name+" =======");
	  var profitabilityArr=[];
	  Object.keys(req.body.algos).forEach(function (key) {
			if (req.body.algos[key].hashrate !== undefined && key in configModule.algos){
				profitabilityArr.push({algo:key,profitability:req.body.algos[key].hashrate * configModule.algos[key].profitability});
				//console.log(key+": "+(req.body.algos[key].hashrate * configModule.algos[key].profitability).toFixed(8));
				if (req.body.algos[key].hashrate * configModule.algos[key].profitability > bestProfitability){
					bestProfitability=req.body.algos[key].hashrate * configModule.algos[key].profitability;
					bestAlgo=key;
				}
			}
	  });
	  profitabilityArr.sort(function(a,b) {return (a.profitability > b.profitability) ? 1 : ((b.profitability > a.profitability) ? -1 : 0);}).reverse();
	  if (bestAlgo!==""){
		var result=configModule.pools[configModule.algos[bestAlgo].pool].baseUrl;
		result = result.replace("#ALGO#", bestAlgo);
		if (configModule.pools[configModule.algos[bestAlgo].pool].regions!==null)
			result = result.replace("#REGION#", req.body.region);
		result = result.replace("#PORT#", configModule.algos[bestAlgo].port);
		if (req.body.name!==undefined){
			if (configModule.logs.length===320)
				configModule.logs.pop();
			var date=convertUTCDateToLocalDate(new Date()).toJSON();
			var entry={
				date: "["+date.slice(0,10)+" "+date.slice(11,19)+"]",
				name: req.body.name,
				algo: bestAlgo,
				pool: configModule.algos[bestAlgo].pool,
				profitability: bestProfitability.toFixed(8)
				
			};
			configModule.logs.unshift(entry);
		}
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({result: {url:result,profitability:configModule.algos[bestAlgo].profitability,pool:configModule.algos[bestAlgo].pool,algo:bestAlgo,profitabilityArr:profitabilityArr}}));
	  }
  }else{
	var date=convertUTCDateToLocalDate(new Date()).toJSON();
	console.log("["+date.slice(0,10)+" "+date.slice(11,19)+"] failed query with following body: "+req.body)
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify({result: false}));
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
    path: path,
	headers:{'Cache-Control':'no-cache'}
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
        console.log("Error: Unable to get "+pool+" profitability data, retrying in 10 sec...");
        console.log(error);
		setTimeout(function(){
			getProfitability(pool);
		},10000);
      }
      if (parsed != null){
		switch (pool){
			case "nicehash":
				Object.keys(parsed.result.simplemultialgo).forEach(function (key) {
					setRealProfitability(parsed.result.simplemultialgo[key].name,parsed.result.simplemultialgo[key].paying,pool,parsed.result.simplemultialgo[key].port);
				});
				break;
			case "zpool":
				Object.keys(parsed).forEach(function (key) {
					setRealProfitability(parsed[key].name,parseFloat(parsed[key].estimate_current)*0.5,pool,parsed[key].port);
				});
				break;
		}
      }
    });
  }).on("error", function(error) {
    console.log("Error: Unable to get "+pool+" profitability data, retrying in 10 sec...");
    console.log(error);
	setTimeout(function(){
		getProfitability(pool);
	},10000);
  });
}


function setRealProfitability(key,profitability,pool,port){
	if (configModule.pools[pool].algos[key]!==undefined){
		var newKey=key;
		if (configModule.pools[pool].algos[key].alt!==undefined)
			newKey=configModule.pools[pool].algos[key].alt;
		var newProfitability=0;
		var ignore=false;
		if (pool==="zpool"){
			if (configModule.pools[pool].algos[key].estimate_prev.length===configModule.config.prevAmountZpool)
				configModule.pools[pool].algos[key].estimate_prev.pop();
			configModule.pools[pool].algos[key].estimate_prev.unshift(profitability);
			
			for (var i=0;i< configModule.pools[pool].algos[key].estimate_prev.length-1;i++){
				if (configModule.pools[pool].algos[key].estimate_prev[i] - configModule.pools[pool].algos[key].estimate_prev[i+1] > configModule.config.thresholdZpool){
					ignore=true;
					break;
				}else{
					ignore=false;
				}
			}
			
		}
		if (!ignore){
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
			if (configModule.algos[newKey].pool === pool){
				configModule.algos[newKey].profitability=newProfitability;
				configModule.algos[newKey].pool=pool;
				configModule.algos[newKey].port=port;
			}else{
				if (configModule.algos[newKey].profitability<newProfitability){
					configModule.algos[newKey].profitability=newProfitability;
					configModule.algos[newKey].pool=pool;
					configModule.algos[newKey].port=port;
				}
			}
		}
		
		
	}
}



function init() {
	if (configModule.config.enabled.nicehash)
		getProfitability("nicehash");

	var minutes = 2, profitabilityInterval = minutes * 60 * 1000;
	setInterval(function () {
		if (configModule.config.enabled.nicehash)
			getProfitability("nicehash");
	}, profitabilityInterval);
}

setTimeout(init, 1000);

exports.query = query;

