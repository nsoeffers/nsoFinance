'use strict';

angular.module('yoApp')
  .controller('RootCtrl', function($scope, $rootScope, $locale, $cookies, $window, categoryRepository, syncManager, translations){
      var NOTIFICATION_EVENT = 'notification';

      $scope.languages = [];
      $scope.notifications = [];
      $scope.isSyncConfigured = syncManager.isConfigured();
      $rootScope.categories = [];

      $rootScope.mapCategoryToLabel = function(category) {
          if ( category === undefined || category === null ){
              return "";
          }
          return category.name;
      };


      $scope.init = function() {
          for(var key in translations){
              if ( key.length === 2){
                  $scope.languages.push(key);
              }
          }
          categoryRepository.findAll(function(categories){
              $rootScope.categories = categories;
          });
      };

      $scope.getLanguageSelectedClass = function(language){
          var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
          return (selectedLanguage == language? 'active' : '');
      };

      $scope.setLanguage = function(language){
          $cookies.languagePreference = language;
          $window.location.reload();
      };

      $scope.sync = function() {
          $scope.syncing = true;
          syncManager.sync(function() {
              $scope.$apply(function() {
                  $scope.syncing = false;
              });
          });
      };

      $scope.$on(NOTIFICATION_EVENT, function(event, notification){
          $scope.notifications.push(notification);
          $scope.$apply();
      });
  });
