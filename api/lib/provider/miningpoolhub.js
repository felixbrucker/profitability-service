const axios = require('axios');
const BaseProvider = require('./base-provider');


module.exports = class Miningpoolhub extends BaseProvider {
  static supportsSSL(algorithm) {
    switch (algorithm) {
      case 'cryptonight':
        return true;
      case 'equihash':
        return true;
      default:
        return false;
    }
  }

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
    const algorithms = Object.keys(query.algos).map(key => Miningpoolhub.normalizeAlgorithmName(key));
    const relevantProfitabilityData = this.profitabilityData.filter(obj => Miningpoolhub.algorithmInArray(Miningpoolhub.normalizeAlgorithmName(obj.algorithm), algorithms));
    const result = relevantProfitabilityData
      .map((obj) => {
        let useSSL = obj.supportsSSL;
        if (obj.supportsSSL) {
          useSSL = query.algos[obj.algorithm].supportsSSL;
        }
        const domain = obj.useDefaultDomain ? 'hub.miningpoolhub.com' : `${Miningpoolhub.normalizeRegion(query.region)}.${obj.algorithm}-hub.miningpoolhub.com`;
        return {
          algorithm: Miningpoolhub.normalizeAlgorithmName(obj.algorithm),
          profitability: obj.profitability * query.algos[obj.algorithm].hashrate,
          stratum: `stratum+${useSSL ? 'ssl' : 'tcp'}://${domain}:${obj.port}`,
          isSSL: useSSL,
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

  async refreshProfitabilityData() {
    try {
      let data = await axios.get('https://miningpoolhub.com/index.php?page=api&action=getautoswitchingandprofitsstatistics');
      data = data.data.return;
      this.profitabilityData = data.map((obj) => ({
        algorithm: obj.algo.toLowerCase(),
        profitability: obj.profit / (1000 * 1000 * 1000), // BTC/GH -> BTC/H
        port: obj.algo_switch_port,
        supportsSSL: Miningpoolhub.supportsSSL(obj.algo.toLowerCase()),
        useDefaultDomain: obj.host === 'hub.miningpoolhub.com',
      }));
    } catch (err) {
      console.error(`[Nicehash] :: Error getting profitability data: ${err.message}`);
    }
  }
};