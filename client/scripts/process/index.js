'use strict';
if (typeof define !== 'function') { var define = require('amdefine')(module); }
/* jshint unused: false */
define([
           'angular', 'angular-bootstrap',
           'camunda-tasklist-ui/process/data',
           'text!camunda-tasklist-ui/process/start.html'
], function(angular) {

  var processModule = angular.module('cam.tasklist.process', [
    'cam.tasklist.process.data',
    'ui.bootstrap'
  ]);



  processModule.controller('processStartModalFormCtrl', [
          '$scope', '$q', 'camLegacyProcessData',
  function($scope,   $q,   camLegacyProcessData) {
    var emptyVariable = {
      name:   '',
      value:  '',
      type:   ''
    };

    // http://docs.camunda.org/latest/api-references/rest/#process-definition-start-process-instance-method
    // Valid variable values are Boolean, Number, String and Date values.
    // NOTE: Actually... forget the docs...
    var variableTypes = {
      'Boolean':  'checkbox',
      'Integer':  'text',
      'Double':   'text',
      'Long':     'text',
      'Short':    'text',
      'String':   'text',
      'Date':     'datetime'
    };

    function close(result) {
      var isFunction = angular.isFunction($scope.$close);

      var cb =  isFunction ?
                $scope.$close :
                angular.noop;

      cb(result);
    }

    function loadError(err) {
      $scope.loadingProcesses = false;
    }

    // used by the pagination directive
    $scope.currentPage = 1;

    $scope.itemsPerPage = 25;

    $scope.totalProcesses = 0;

    $scope.processes = [];

    $scope.variables = [];

    $scope.variableTypes = variableTypes;

    $scope.loadingProcesses = false;


    // $scope.setPage = function (pageNo) {
    //   $scope.currentPage = pageNo;
    // };

    // $scope.$watch('currentPage', function() {
    //   console.info('Changed currentPage', $scope.currentPage);
    // });

    // $scope.pageChanged = function() {
    //   console.log('Page changed to: ' + $scope.currentPage, $scope.$id, this.$id);
    //   // $scope.currentPage = this.currentPage;
    //   $scope.setPage(this.currentPage);
    // };


    $scope.close = close;


    $scope.selected = function($item, $model, $label) {
      $scope.startingProcess = $item;
    };


    $scope.lookupProcess = function(val) {
      if (val.length > 2) {
        $scope.loadingProcesses = true;

        return camLegacyProcessData.list({
          nameLike: '%'+ val +'%'
        }).then(function(res){
          $scope.loadingProcesses = false;
          return res;
        }, loadError);
      }
      else {
        var deferred = $q.defer();

        deferred.resolve($scope.processes);

        return deferred.promise;
      }
    };


    $scope.showList = function() {
      $scope.startingProcess = null;
    };


    $scope.loadProcesses = function() {
      $scope.loadingProcesses = true;
      var where = {};

      // I found that in the REST API documentation,
      // I supposed it was aimed to be used,
      // but using it lead to empty results
      // where.startableBy = camStorage.get('user').id;

      camLegacyProcessData.count(where)
      .then(function(result) {
        $scope.totalProcesses = result.count;

        where.maxResults = where.maxResults || $scope.itemsPerPage;

        camLegacyProcessData.list(where)
        .then(function(processes) {
          $scope.loadingProcesses = false;

          $scope.processes = processes;
        }, loadError);
      }, loadError);
    };
    $scope.loadProcesses();


    $scope.getStartForm = function(startingProcess) {
      $scope.startingProcess = startingProcess;
      $scope.variables = [];
      $scope.addVariable();
    };


    $scope.addVariable = function() {
      $scope.variables.push(angular.copy(emptyVariable));
    };
    $scope.addVariable();


    $scope.removeVariable = function(delta) {
      var vars = [];

      angular.forEach($scope.variables, function(variable, d) {
        if (d != delta) {
          vars.push(variable);
        }
      });

      $scope.variables = vars;
    };


    $scope.submitForm = function(htmlForm) {
      if (!$scope.startingProcess || !$scope.startingProcess.key) {
        return false;
      }

      var vars = {};

      angular.forEach($scope.variables, function(val) {
        if (val.name[0] !== '$') {
          vars[val.name] = {type: val.type, value: val.value};
        }
      });

      camLegacyProcessData.start($scope.startingProcess.key, {
        data: {
          variables: vars
        }
      }).then(function(result) {
        close(result);
      }, loadError);
    };
  }]);


  processModule.controller('processStartCtrl', [
          '$modal', '$scope',
  function($modal,   $scope) {
    $scope.openProcessStartModal = function() {
      $modal.open({
        size: 'lg',
        controller: 'processStartModalFormCtrl',
        template: require('text!camunda-tasklist-ui/process/start.html')
      });
    };
  }]);

  return processModule;
});
