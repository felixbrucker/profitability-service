const axios = require('axios');
const BaseProvider = require('./base-provider');


module.exports = class Nicehash extends BaseProvider {
  static getSSLPort(algorithm) {
    switch (algorithm) {
      case 'cryptonight':
        return 33355;
      case 'equihash':
        return 33357;
      default:
        return null;
    }
  }

  getMostProfitableStratumsForQuery(query) {
    const algorithms = Object.keys(query.algos).map(key => Nicehash.normalizeAlgorithmName(key));
    const relevantProfitabilityData = this.profitabilityData.filter(obj => Nicehash.algorithmInArray(obj.algorithm, algorithms));
    const result = relevantProfitabilityData
      .map((obj) => {
        const normalizedAlgorithmName = Nicehash.normalizeAlgorithmName(obj.algorithm);
        let useSSL = obj.supportsSSL;
        if (obj.supportsSSL) {
          useSSL = query.algos[normalizedAlgorithmName].supportsSSL;
        }
        return {
          algorithm: normalizedAlgorithmName,
          profitability: obj.profitability * query.algos[normalizedAlgorithmName].hashrate,
          stratum: `stratum+${useSSL ? 'ssl' : 'tcp'}://${obj.algorithm}.${query.region}.nicehash.com:${useSSL ? obj.sslPort : obj.port}`,
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
      let data = await axios.get('https://api.nicehash.com/api?method=simplemultialgo.info');
      data = data.data.result.simplemultialgo;
      this.profitabilityData = data.map((obj) => {
        const sslPort = Nicehash.getSSLPort(obj.name);
        const data = {
          algorithm: obj.name,
          profitability: parseFloat(obj.paying) / (1000 * 1000 * 1000), // BTC/GH -> BTC/H
          port: obj.port,
          supportsSSL: false,
        };
        if (sslPort !== null) {
          data.supportsSSL = true;
          data.sslPort = sslPort;
        }
        return data;
      });
    } catch (err) {
      console.error(`[Nicehash] :: Error getting profitability data: ${err.message}`);
    }
  }
};