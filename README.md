# profitability-service

### Prerequisites

profitability-service requires nodejs, npm and optionally pm2 to run.


### Installation

```sh
git clone https://github.com/felixbrucker/profitability-service
cd profitability-service
npm install
npm install pm2 -g
```

### Run

```sh
pm2 start process.json
```

or

```sh
npm start
```

to startup on boot:

```sh
pm2 save
pm2 startup
```

### Update software

run ``` git pull ```


### JSON template to query

```sh
{
	"algos": {
		"x11": {"hashrate":150000000, "supportsSSL": false},
		"x13": {"hashrate":150000000, "supportsSSL": false},
		"x14": {"hashrate":150000000, "supportsSSL": false},
		"x15": {"hashrate":150000000, "supportsSSL": false},
		"quark": {"hashrate":150000000, "supportsSSL": false},
		"qubit": {"hashrate":150000000, "supportsSSL": false}
	},
	"region": "eu",
	"name": "Baikal Mini Miner",
	"provider": "nicehash"
}
```

Hashrate is in Hash/sec, region can be one of these: ["eu","usa","hk","jp", "in", "br"]
Provider can be either "nicehash" or "miningpoolhub"

### JSON template for responses from the server

```sh
{
   "result":[
      {
         "algorithm":"x15",
         "profitability":0.000135816,
         "stratum":"stratum+tcp://x15.eu.nicehash.com:3339",
         "isSSL":false
      },
      {
         "algorithm":"x13",
         "profitability":0.00010698899999999999,
         "stratum":"stratum+tcp://x13.eu.nicehash.com:3337",
         "isSSL":false
      },
      {
         "algorithm":"quark",
         "profitability":0.00007946249999999999,
         "stratum":"stratum+tcp://quark.eu.nicehash.com:3345",
         "isSSL":false
      },
      {
         "algorithm":"qubit",
         "profitability":0.000067578,
         "stratum":"stratum+tcp://qubit.eu.nicehash.com:3344",
         "isSSL":false
      },
      {
         "algorithm":"x11",
         "profitability":0.000006879,
         "stratum":"stratum+tcp://x11.eu.nicehash.com:3336",
         "isSSL":false
      }
   ]
}
```

in case something is wrong/missing in the query:

```sh
{
	"result": false
}
```

### complete list of supported algos

* myriad-groestl
* blake2s
* cryptonight
* daggerhashimoto
* decred
* equihash
* groestl
* keccak
* lbry
* lyra2re
* lyra2rev2
* lyra2z
* neoscrypt
* nist5
* pascal
* quark
* qubit
* scrypt
* sha256
* sia
* skein
* skunk
* x11
* x11gost
* x13
* x15
* yescrypt


### Todos

 - Add Code Comments
 - Write Tests


License
----

GNU GPLv3 (see LICENSE)
