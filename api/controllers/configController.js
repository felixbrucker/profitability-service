const configModule = require(__basedir + 'api/modules/configModule');


function getConfig(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(configModule.config));
}

function getAlgos(req, res, next) {
  const algorithms = Object.keys(configModule.algos);
  const nicehashProfitability = algorithms.map(algo => global.nicehash.getProfitabilityForAlgorithm(algo));
  const miningpoolhubProfitability = algorithms.map(algo => global.miningpoolhub.getProfitabilityForAlgorithm(algo));
  const result = {};
  for (let i = 0; i < algorithms.length; i += 1) {
    if (!miningpoolhubProfitability[i] && !nicehashProfitability[i]) {
      // not supported by both
      result[algorithms[i]] = {profitability: 0, pool: ''};
    }
    if (!miningpoolhubProfitability[i]) {
      // mph doesnt support it
      result[algorithms[i]] = {profitability: nicehashProfitability[i], pool: 'nicehash'};
    }
    if (!nicehashProfitability[i]) {
      // nicehash doesnt support it
      result[algorithms[i]] = {profitability: miningpoolhubProfitability[i], pool: 'miningpoolhub'};
    }
    if (nicehashProfitability[i] > miningpoolhubProfitability[i]) {
      result[algorithms[i]] = {profitability: nicehashProfitability[i], pool: 'nicehash'};
    } else {
      result[algorithms[i]] = {profitability: miningpoolhubProfitability[i], pool: 'miningpoolhub'};
    }
  }
  res.send(result);
}

function setConfig(req, res, next) {
  configModule.setConfig(req.body);
  configModule.saveConfig();
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({success: true}));
}

function update(req, res, next) {
  const spawn = require('cross-spawn');
  const child = spawn('git',['pull'],{
      detached: true,
      stdio: 'ignore',
      shell:true
    });
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({success:true}));
}

function init() {
}

init();

exports.getConfig = getConfig;
exports.setConfig = setConfig;
exports.update = update;
exports.getAlgos = getAlgos;
