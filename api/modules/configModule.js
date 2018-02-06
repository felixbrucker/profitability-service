const colors = require('colors/safe');
const fs = require('fs');

const configPath = 'data/settings.json';

if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}
const config = module.exports = {
  config: {
    cryptonightPools: {
      'ITNS': {enabled: false, supportsSSL: false, url: 'pool.intense.hashvault.pro', port: 5555, user: '', pass: ''},
      'XLC': {enabled: false, supportsSSL: true, url: 'xlc.dark-mine.su', port: 5555, sslPort: 1443, user: '', pass: ''},
      'ETN': {
        supportsSSL: true,
        url: '#REGION#.cryptonight-hub.miningpoolhub.com',
        port: 20596,
        sslPort: 20596,
        user: '',
        pass: '',
      },
      'SUMO': {enabled: false, supportsSSL: false, url: 'pool.sumokoin.com', port: 4444, user: '', pass: ''},
      'KRB': {enabled: false, supportsSSL: false, url: 'krb.sberex.com', port: 5555, user: '', pass: ''},
      'XMR': {
        supportsSSL: true,
        url: '#REGION#.cryptonight-hub.miningpoolhub.com',
        port: 20580,
        sslPort: 20580,
        user: '',
        pass: '',
      },
      'BCN': {enabled: false, supportsSSL: false, url: 'bytecoin.uk', port: 7777, user: '', pass: ''},
    }
  },
  algos: {
    'myriad-groestl': {profitability: 0, pool: ''},
    blake2s: {profitability: 0, pool: ''},
    cryptonight: {profitability: 0, pool: ''},
    daggerhashimoto: {profitability: 0, pool: ''},
    decred: {profitability: 0, pool: ''},
    equihash: {profitability: 0, pool: ''},
    groestl: {profitability: 0, pool: ''},
    keccak: {profitability: 0, pool: ''},
    lbry: {profitability: 0, pool: ''},
    lyra2re: {profitability: 0, pool: ''},
    lyra2rev2: {profitability: 0, pool: ''},
    lyra2z: {profitability: 0, pool: ''},
    neoscrypt: {profitability: 0, pool: ''},
    nist5: {profitability: 0, pool: ''},
    pascal: {profitability: 0, pool: ''},
    quark: {profitability: 0, pool: ''},
    qubit: {profitability: 0, pool: ''},
    scrypt: {profitability: 0, pool: ''},
    sha256: {profitability: 0, pool: ''},
    sia: {profitability: 0, pool: ''},
    skein: {profitability: 0, pool: ''},
    skunk: {profitability: 0, pool: ''},
    x11: {profitability: 0, pool: ''},
    x11gost: {profitability: 0, pool: ''},
    x13: {profitability: 0, pool: ''},
    x15: {profitability: 0, pool: ''},
    yescrypt: {profitability: 0, pool: ''},
  },
  logs: [],
  getConfig: function () {
    return config.config;
  },
  setConfig: function (newConfig) {
    config.config = newConfig;
  },
  saveConfig: function () {
    console.log(colors.grey('writing config to file..'));
    fs.writeFile(configPath, JSON.stringify(config.config, null, 2), function (err) {
      if (err) {
        return console.log(err);
      }
    });
  },
  loadConfig: function () {
    fs.stat(configPath, function (err) {
      if (err === null) {
        fs.readFile(configPath, 'utf8', function (err, data) {
          if (err) throw err;
          config.config = JSON.parse(data);
          if (!config.config.cryptonightPools) {
            config.config.cryptonightPools = {
              'ITNS': {enabled: false, supportsSSL: false, url: 'pool.intense.hashvault.pro', port: 5555, user: '', pass: ''},
              'XLC': {enabled: false, supportsSSL: true, url: 'xlc.dark-mine.su', port: 5555, sslPort: 1443, user: '', pass: ''},
              'ETN': {
                supportsSSL: true,
                url: '#REGION#.cryptonight-hub.miningpoolhub.com',
                port: 20596,
                sslPort: 20596,
                user: '',
                pass: '',
              },
              'SUMO': {enabled: false, supportsSSL: false, url: 'pool.sumokoin.com', port: 4444, user: '', pass: ''},
              'KRB': {enabled: false, supportsSSL: false, url: 'krb.sberex.com', port: 5555, user: '', pass: ''},
              'XMR': {
                supportsSSL: true,
                url: '#REGION#.cryptonight-hub.miningpoolhub.com',
                port: 20580,
                sslPort: 20580,
                user: '',
                pass: '',
              },
              'BCN': {enabled: false, supportsSSL: false, url: 'bytecoin.uk', port: 7777, user: '', pass: ''},
            };
          }
        });
      } else if (err.code === 'ENOENT') {
        //default conf
        config.saveConfig();
      }
    });
  }
};
console.log('initializing, please wait...');
config.loadConfig();
