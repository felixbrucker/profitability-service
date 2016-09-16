'use strict';

var express = require('express');

module.exports = function(app) {
  var router = express.Router();

  var configController = require(__basedir + 'api/controllers/configController');
  var statsController = require(__basedir + 'api/controllers/statsController');
  var profitabilityController = require(__basedir + 'api/controllers/profitabilityController');

  router.get('/config', configController.getConfig);
  router.post('/config', configController.setConfig);
  router.post('/config/update', configController.update);
  router.get('/config/algos', configController.getAlgos);

  router.get('/stats', statsController.getStats);
  
  router.post('/query', profitabilityController.query);

  app.use('/api', router);
};
