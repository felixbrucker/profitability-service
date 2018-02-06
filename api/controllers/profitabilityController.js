const moment = require('moment');
const configModule = require(__basedir + 'api/modules/configModule');

const Nicehash = require('../lib/provider/nicehash');
const Miningpoolhub = require('../lib/provider/miningpoolhub');
const Minecryptonight = require('../lib/provider/minecryptonight');

const nicehash = new Nicehash({
	interval: 2 * 60 * 1000,
});
const miningpoolhub = new Miningpoolhub({
  interval: 2 * 60 * 1000,
});
const minecryptonight = new Minecryptonight({
  interval: 10 * 60 * 1000,
});

global.nicehash = nicehash;
global.miningpoolhub = miningpoolhub;
global.minecryptonight = minecryptonight;

function isValidQuery(query) {
	if (!query.algos) {
		return false;
	}
	if (!query.region) {
		return false;
	}
	if(!query.name) {
		return false;
	}
	if(!query.provider) {
		return false;
	}

	return true;
}

function query(req, res, next) {
	const query = {
    algos: req.body.algos,
    region: req.body.region,
    name: req.body.name,
    provider: req.body.provider,
	};
	if (!isValidQuery(query)) {
		return res.send({result: false});
	}

  const providers = query.provider;

  const profitabilities = [].concat.apply(
  	[],
		providers.map(provider => global[provider].getMostProfitableStratumsForQuery(query))
	);
  profitabilities.sort((a, b) => b.profitability - a.profitability);

	if (profitabilities.length === 0) {
		console.error(`[Query] :: nothing returned for query: \n${JSON.stringify(query, null, 2)}`);
		return res.send({result: false});
	}

  const entry={
    date: moment().format('YYYY-MM-DD HH:mm:ss'),
    name: query.name,
    algo: profitabilities[0].algorithm,
    pool: profitabilities[0].provider + (profitabilities[0].symbol ? `-${profitabilities[0].symbol}` : ''),
    profitability: profitabilities[0].profitability.toFixed(8)
  };
  if (configModule.logs.length===320) {
    configModule.logs.pop();
	}
  configModule.logs.unshift(entry);

  return res.send({result: profitabilities});
}


function init() {}

setTimeout(init, 1000);

exports.query = query;

