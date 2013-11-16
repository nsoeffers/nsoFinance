'use strict';

angular.module('yoApp')
  .controller('CategoryListCtrl', function ($scope, $rootScope, $window, domain, categoryRepository) {
      var CATEGORY_SELECTED_EVENT = 'categorySelected';

      $scope.categories = [];
      $scope.errorMessage = null;
      $scope.loading = false;
      $scope.selectedCategoryType = domain.CategoryType.ASSET;

      $scope.refresh = function() {
          $scope.loading = true;
          $scope.$emit(CATEGORY_SELECTED_EVENT, null);
          categoryRepository.findCategoriesByType($scope.selectedCategoryType, function(results){
              $scope.categories = results;
              $scope.loading = false;
              $scope.$apply();
          }, domain.Category.createFromDBO);
      };

      $scope.select = function(category) {
          $scope.$emit(CATEGORY_SELECTED_EVENT, category);
      };

      $scope.add = function() {
          var newCategory = new domain.Category($scope.selectedCategoryType, '');
          $scope.$emit(CATEGORY_SELECTED_EVENT, newCategory);
          $scope.categories.push(newCategory);
      };

      $scope.remove = function(category) {
          categoryRepository.remove(category.id, function() {
              var selectedIndex =  $scope.categories.indexOf(category);
              $scope.categories.splice(selectedIndex, 1);
              $rootScope.$broadcast(CATEGORY_SELECTED_EVENT, (selectedIndex-1) < $scope.categories.length && (selectedIndex-1) >= 0? $scope.categories[selectedIndex-1]: null);
              $scope.$apply();
          });
      };

  });
