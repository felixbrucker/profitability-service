const axios = require('axios');
const BaseProvider = require('./base-provider');
const config = require('../../modules/configModule');

module.exports = class Minecryptonight extends BaseProvider {
  static normalizeRegion(region) {
    switch (region) {
      case 'eu':
        return 'europe';
      case 'usa':
        return 'us-east';
      case 'hk':
      case 'jp':
        return 'asia';
      default:
        return 'us-east';
    }
  }

  getMostProfitableStratumsForQuery(query) {
    if (!query.algos.cryptonight) {
      // oh no, cryptonight not enabled
      return [];
    }
    const result = this.profitabilityData
      .filter(obj => config.config.cryptonightPools[obj.symbol].enabled)
      .map((obj) => {
        const algorithm = obj.algorithm;
        const pool = config.config.cryptonightPools[obj.symbol];
        pool.url = pool.url.replace('#REGION#', Minecryptonight.normalizeRegion(query.region));
        let useSSL = pool.supportsSSL;
        if (pool.supportsSSL) {
          useSSL = query.algos[algorithm].supportsSSL;
        }

        return {
          algorithm,
          profitability: obj.profitability * query.algos[algorithm].hashrate,
          stratum: `stratum+${useSSL ? 'ssl' : 'tcp'}://${pool.url}:${useSSL ? pool.sslPort : pool.port}`,
          isSSL: useSSL,
          user: pool.user,
          pass: pool.pass,
          symbol: obj.symbol,
          provider: 'minecryptonight',
        };
      });
    // sort desc
    result.sort((a, b) => {
      if (a.profitability < b.profitability) {
        return 1;
      }
      if (a.profitability > b.profitability) {
        return -1;
      }
      if (a.isSSL) {
        return -1;
      }
      if (b.isSSL) {
        return 1;
      }
      return 0;
    });

    return result;
  }

  getProfitabilityForAlgorithm(algorithm) {
    if (algorithm !== 'cryptonight') {
      return null;
    }
    const data = JSON.parse(JSON.stringify(this.profitabilityData));
    // return best profitability
    data.sort((a, b) => b.profitability - a.profitability);
    return data[0].profitability;
  }

  async refreshProfitabilityData() {
    try {
      let data = await axios.get('http://minecryptonight.net/api/rewards?hr=1000');
      data = data.data.rewards;
      this.profitabilityData = data.map((obj) => ({
        algorithm: 'cryptonight',
        symbol: obj.ticker_symbol,
        profitability: obj.reward_24h.btc / 1000, // BTC/KH -> BTC/H
      }));
    } catch (err) {
      console.error(`[Minecryptonight] :: Error getting profitability data: ${err.message}`);
    }
  }
};