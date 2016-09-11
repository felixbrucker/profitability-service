'use strict';

const https = require('https');
const http = require('http');
var fs = require('fs');
var colors = require('colors/safe');

var configModule = require(__basedir + 'api/modules/configModule');


function getStats(req, res, next) {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(configModule.logs));
}



function init() {
  
}

setTimeout(init, 1000);

exports.getStats = getStats;

