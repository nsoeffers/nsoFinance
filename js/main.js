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
        .run(function() {
            $('.loadingPanel').hide();
        });
});