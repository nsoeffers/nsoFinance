'use strict';

angular.module('yoApp')
  .controller('CategoryDetailCtrl', function ($scope, $rootScope, $window, $timeout, $cookies, $locale, categoryRepository) {
    var CATEGORY_SELECTED_EVENT = 'categorySelected';
    var CATEGORY_SAVED_EVENT = 'categorySaved';

    $scope.$parent.$parent.$on(CATEGORY_SELECTED_EVENT, function(event, category) {
        if ( category !== null ) {
            $('#infoMessageForm').alert('close');
        }
        $scope.alreadySubmitted = false;
        $scope.category = category;
        $timeout(function(){ $('#inputCategoryName').focus(); }, 100);
        //$scope.$apply();
    });

    $scope.save = function() {
        $scope.alreadySubmitted = true;
        categoryRepository.save($scope.category, function(savedCategory){
            $rootScope.categories.push(savedCategory);
            $scope.showSuccessMessage = true;
            $scope.$emit(CATEGORY_SAVED_EVENT, savedCategory);
            $scope.$apply();
            $timeout(function() {
                $scope.showSuccessMessage = false;
                $scope.alreadySubmitted = false;
            }, 3000);
        }, function(event) {
            if ( event.target !== undefined && event.target !== null && event.target.errorCode === 5){
                var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
                $scope.errorMessage = translations[selectedLanguage].duplicateCategoryName;
            } else if ( event.target !== undefined && event.target !== null && event.target.webkitErrorMessage !== undefined) {
                $scope.errorMessage = event.target.webkitErrorMessage;
            }
            $scope.alreadySubmitted = false;
            $scope.$apply();
        });
    };

    $scope.alreadySubmitted = false;

    $scope.category = null;

    $scope.showSuccessMessage = false;
});
