const configModule = require(__basedir + 'api/modules/configModule');


function getConfig(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(configModule.config));
}

function getAlgos(req, res, next) {
  const algorithms = Object.keys(configModule.algos);
  const providers = [
    'nicehash',
    'miningpoolhub',
    'minecryptonight'
  ];
  const profitabilities = providers.map(provider => ({
    name: provider, profitabilities: algorithms.map(algo => global[provider].getProfitabilityForAlgorithm(algo)),
  }));

  const result = {};
  for (let i = 0; i < algorithms.length; i += 1) {
    const algo = algorithms[i];
    const providerWithAlgo = profitabilities.filter((provider => provider.profitabilities[i] !== null));
    if (providerWithAlgo.length < 1) {
      result[algo] = {profitability: 0, pool: ''};
      continue;
    }
    providerWithAlgo.sort((a, b) => {
      if (a.profitabilities[i] < b.profitabilities[i]) {
        return 1;
      }
      if (a.profitabilities[i] > b.profitabilities[i]) {
        return -1;
      }
      return 0;
    });
    result[algo] = {profitability: providerWithAlgo[0].profitabilities[i], pool: providerWithAlgo[0].name};
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
