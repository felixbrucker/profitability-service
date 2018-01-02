module.exports = class BaseProvider {
  static algorithmInArray(algorithm, array) {
    return array.indexOf(algorithm) !== -1;
  }

  static normalizeAlgorithmName(algorithm) {
    switch(algorithm) {
      case 'sib':
        return 'x11gost';
      case 'ethash':
        return 'daggerhashimoto';
      case 'lyra2re2':
        return 'lyra2rev2';
      default:
        return algorithm;
    }
  }

  static revertAlgorithmNameNormalization(algorithm) {
    switch(algorithm) {
      case 'x11gost':
        return 'sib';
      case 'daggerhashimoto':
        return 'ethash';
      case 'lyra2rev2':
        return 'lyra2re2';
      default:
        return algorithm;
    }
  }

  constructor(options) {
    this.interval = options.interval;
    this.profitabilityData = [];
    this.onInit();
  }

  getProfitabilityForAlgorithm(algorithm) {
    const data = this.profitabilityData.find(obj => BaseProvider.normalizeAlgorithmName(obj.algorithm) === algorithm);
    return data ? data.profitability: null;
  }

  refreshProfitabilityData() {}

  onInit() {
    this.refreshProfitabilityData();
    setInterval(this.refreshProfitabilityData.bind(this), this.interval);
  }
};