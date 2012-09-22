requirejs.config({
    paths: {
        'jquery'    : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min',
        'angular'   : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min',
        'bootstrap' : 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min',
        'i18next'   : 'i18next-1.5.6.min'
    },
    shim: {
        'angular': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['jquery'],
            exports: 'angular'
        },
        'bootstrap': {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    }
});

require([ 'jquery', 'angular', 'bootstrap', 'translations', 'dao', 'domain', 'controllers', 'domReady'], 
        function($, angular, bootstrap, translations, dao, domain, controllers) {
    angular.module('nsoFinance', [])
        .controller('AccountListCtrl', controllers.AccountListCtrl)
        .controller('AccountDetailCtrl', controllers.AccountDetailCtrl)
        .factory('Dao', dao.init)
        .value('Translations', translations)
        .directive('myappLabel', function(Translations,$locale){ 
            return function(scope, elm, attrs){
                elm.text(Translations[$locale.id][attrs.label]);
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
        .run(function() {
            $('.loadingPanel').hide();
        });
});