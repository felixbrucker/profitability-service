/**
 * @namespace configCtrl
 *
 * @author: Felix Brucker
 * @version: v0.0.1
 *
 * @description
 * handles functionality for the config page
 *
 */
(function () {
  'use strict';

  angular
    .module('app')
    .controller('configCtrl', configController);

  function configController($scope, $interval, $http) {

    var vm = this;
    vm.config = null;
    vm.algos = null;
    vm.updating = null;
    vm.waiting = null;
    vm.algoInterval = null;


    // controller API
    vm.init = init;
    vm.getConfig = getConfig;
    vm.setConfig = setConfig;
    vm.update = update;
    vm.testQuery = testQuery;
    vm.getAlgos = getAlgos;
    vm.getFormattedProfitability = getFormattedProfitability;


    /**
     * @name init
     * @desc data initialization function
     * @memberOf configCtrl
     */
    function init() {
      angular.element(document).ready(function () {
        vm.getConfig();
        vm.getAlgos();
        vm.algoInterval = $interval(vm.getAlgos, 5000);
      });
    }

    /**
     * @name getConfig
     * @desc get the config
     * @memberOf configCtrl
     */
    function getConfig() {
      return $http({
        method: 'GET',
        url: 'api/config'
      }).then(function successCallback(response) {
        vm.config = response.data;
      }, function errorCallback(response) {
        console.log(response);
      });
    }


    /**
     * @name setConfig
     * @desc set the config
     * @memberOf configCtrl
     */
    function setConfig() {
      vm.waiting = true;
      return $http({
        method: 'POST',
        url: 'api/config',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: vm.config
      }).then(function successCallback(response) {
        setTimeout(function () {
          vm.waiting = false;
        }, 500);
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    /**
     * @name update
     * @desc updates the project from git
     * @memberOf configCtrl
     */
    function update() {
      vm.updating = true;
      return $http({
        method: 'POST',
        url: 'api/config/update',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }).then(function successCallback(response) {
        setTimeout(function () {
          vm.updating = false;
        }, 500);
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    /**
     * @name getAlgos
     * @desc get the algos
     * @memberOf configCtrl
     */
    function getAlgos() {
      return $http({
        method: 'GET',
        url: 'api/config/algos'
      }).then(function successCallback(response) {
        vm.algos = response.data;
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    /**
     * @name testQuery
     * @desc sends a testQuery to the server
     * @memberOf configCtrl
     */
    function testQuery() {
      return $http({
        method: 'POST',
        url: 'api/query',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        data: {
          algos: {
            x11: {hashrate: 150000000, supportsSSL: false},
            x13: {hashrate: 150000000, supportsSSL: false},
            x14: {hashrate: 150000000, supportsSSL: false},
            x15: {hashrate: 150000000, supportsSSL: false},
            quark: {hashrate: 150000000, supportsSSL: false},
            qubit: {hashrate: 150000000, supportsSSL: false},
          },
          region: 'eu',
          name: 'Baikal Mini Miner',
          provider: 'nicehash',
        },
      }).then(function successCallback(response) {
        console.log(response.data.result);
      }, function errorCallback(response) {
        console.log(response);
      });
    }

    function getFormattedProfitability(profitability) {
      const units = [
        '',
        'K',
        'M',
        'G',
        'T',
        'P',
        'E',
        'Z',
        'Y',
      ];
      let counter = 0;
      while (profitability < 0.00001 && profitability !== 0) {
        counter++;
        profitability = profitability * 1000;
      }
      return `${profitability.toFixed(8)} BTC/${units[counter]}H/Day`;
    }


    // call init function on firstload
    vm.init();

    $scope.$on('$destroy', function () {
      if (vm.algoInterval)
        $interval.cancel(vm.algoInterval);
    });
  }

})();
