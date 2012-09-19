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
        },
        'i18next' : {
            deps: ['jquery'],
            exports: '$.i18n'
        }
    }
});

require([ 'jquery', 'angular', 'bootstrap', 'i18next', 'controllers', 'dao', 'domReady'], 
        function($, angular, bootstrap, i18next, controllers, dao) {
    angular.module('nsoFinance', [])
        .controller('AccountListCtrl', controllers.AccountListCtrl)
        .controller('AccountDetailCtrl', controllers.AccountDetailCtrl)
        .factory('Dao', dao.init) ;
    i18next.init({   ns: { namespaces: ['translation'], defaultNs: 'translation'},
                    lng: 'nl',
                    fallbackLng: 'nl',
                    resGetPath: 'locales/__lng__/__ns__.json',
                    useLocalStorage: false,
                    debug: true
                }, function() {
                    $('*[data-i18n]').i18n();
                });    
});