requirejs.config({
    paths: {
        'jquery'            : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min',
        'angular'           : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min',
        'angularCookies'    : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular-cookies.min',
        'bootstrap'         : 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min'
    },
    shim: {
        'angular': {
            deps: ['jquery'],
            exports: 'angular'
        },
        'angularCookies': {
            deps: ['angular']
        },        
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    }
});

require([ 'jquery', 'angular', 'angularCookies', 'bootstrap', 'translations', 'dao', 'domain', 'controllers', 'domReady'], 
        function($, angular, angularCookies, bootstrap, translations, dao, domain, controllers) {
    angular.module('nsoFinance', ['ngCookies'])
        .controller('RootCtrl', controllers.RootCtrl)
        .controller('AccountListCtrl', controllers.AccountListCtrl)
        .controller('AccountDetailCtrl', controllers.AccountDetailCtrl)        
        .factory('Dao', dao.init)
        .value('Translations', translations)
        .directive('myappLabel', function(Translations,$locale, $cookies){ 
            return function(scope, elm, attrs){
                var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
                elm.text(Translations[language][attrs.label]);
            }; 
        })
        .directive('bankAccountNumber', function(){
            var BANK_ACCOUNT_NUMBER_REGEXP = /^(\d{3})-(\d{7})-(\d{2})$/;
            return {
                require: 'ngModel',
                link: function(scope, elm, attrs, ctrl) {
                  ctrl.$parsers.unshift(function(viewValue) {
                    var parts = BANK_ACCOUNT_NUMBER_REGEXP.exec(viewValue);
                    if ( parts !== null && ((parseFloat(parts[1]) * 10000000) + parseFloat(parts[2])) % 97 == parseFloat(parts[3])) {
                      ctrl.$setValidity('bankAccountNumber', true);
                      return viewValue;
                    } else {
                      ctrl.$setValidity('bankAccountNumber', false);
                      return undefined;
                    }
                  });
                }
            };
        })
        .config(function($routeProvider){            
            $routeProvider.when('/Account/', {
                templateUrl: 'account.html'
            }).otherwise({
                templateUrl: 'account.html'
            });
        })
        .run(function() {
            $('.loadingPanel').hide();
        });
});