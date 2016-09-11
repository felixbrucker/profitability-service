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

    function configController($scope,$interval,$http) {

        var vm = this;
        vm.config = null;
        vm.updating=null;
		vm.waiting = null;
        

        // controller API
        vm.init = init;
        vm.getConfig=getConfig;
        vm.setConfig=setConfig;
        vm.update=update;
		vm.testQuery=testQuery;



        /**
         * @name init
         * @desc data initialization function
         * @memberOf configCtrl
         */
        function init() {
            angular.element(document).ready(function () {
                vm.getConfig();
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
            vm.waiting=true;
            return $http({
                method: 'POST',
                url: 'api/config',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                },
                data: vm.config
            }).then(function successCallback(response) {
                setTimeout(function(){vm.waiting = false;},500);
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
            vm.updating=true;
            return $http({
                method: 'POST',
                url: 'api/config/update',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            }).then(function successCallback(response) {
                setTimeout(function(){vm.updating = false;},500);
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
				data: {algos: {x11: {hashrate:150000000},x13: {hashrate:150000000},x14: {hashrate:150000000},x15: {hashrate:150000000},quark: {hashrate:150000000},qubit: {hashrate:150000000}}, region: "eu", name: "Baikal Mini Miner"}
            }).then(function successCallback(response) {
                console.log(response.data.result);
            }, function errorCallback(response) {
                console.log(response);
            });
        }


        // call init function on firstload
        vm.init();

        $scope.$on('$destroy', function () {
            if (vm.configInterval)
                $interval.cancel(vm.configInterval);
        });
    }

})();
