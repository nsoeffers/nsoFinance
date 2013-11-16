'use strict';

angular.module('yoApp')
  .directive('i18nKey', function(translations,$locale, $cookies, $interpolate, $window){
     return {

         compile: function(elm, attrs){
             var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
             elm.text(translations[language][attrs.i18nKey]);
         }
     }
  })
  .filter('translate', function(translations, $locale, $cookies) {
      return function(input) {
          var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
          return translations[language][input];
      };
  });