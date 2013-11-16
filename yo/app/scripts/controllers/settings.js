'use strict';

angular.module('yoApp')
  .controller('SettingsCtrl', function($scope, $window, transactionRepository, dao, syncManager) {
      $scope.tableIds = [];

      $scope.removeAllTransactions = function() {
          transactionRepository.reset(function(){
              // TODO: Give feedback to user and issue a reload of webapp
              $window.location.reload();
          });
      };

      $scope.removeAllData = function() {
          dao.resetAll(function(){
              // TODO: Give feedback to user and issue a reload of webapp
              $window.location.reload();
          });
          syncManager.reset();
      };

  });
