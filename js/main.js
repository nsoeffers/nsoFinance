requirejs.config({
    paths: {
        'jquery'            : 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min',
        'jqueryUI'          : 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.23/jquery-ui.min',
        'angular'           : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min',
        'angularCookies'    : 'https://ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular-cookies.min',
        'bootstrap'         : 'https://netdna.bootstrapcdn.com/twitter-bootstrap/2.1.1/js/bootstrap.min',
        'jquery.csv'        : 'jquery.csv-0.63',
        'modernizr'         : 'modernizr-2.6.2.min',
        'moment'            : 'moment.min',
        'spin'              : 'spin.min',
        'google'            : 'https://www.google.com/jsapi?ext'
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
        },
        'jqueryUI': {
            deps: ['jquery']
        },
        'modernizr' : {
            exports: 'Modernizr'
        }
    }
});

require([ 'jquery', 'angular', 'angularCookies', 'bootstrap', 'translations', 'dao', 'domain', 'controllers', 
          'directives', 'modernizr', 'sync-manager', 'jqueryUI',  'datejs', 'domReady'], 
        function($, angular, angularCookies, bootstrap, translations, dao, domain, controllers, directives, Modernizr, SyncManager) {
    angular.module('nsoFinance', ['ngCookies'])
        .controller('RootCtrl', controllers.RootCtrl)
        .controller('CategoryListCtrl', controllers.CategoryListCtrl)
        .controller('CategoryDetailCtrl', controllers.CategoryDetailCtrl)
        .controller('SettingsCtrl', controllers.SettingsCtrl)        
        .controller('ImportCtrl', controllers.ImportCtrl)
        .controller('AssignCtrl', controllers.AssignCtrl)
        .controller('RulesCtrl', controllers.RulesCtrl)
        .controller('MonthlyOverviewCtrl', controllers.MonthlyOverviewCtrl)
        .factory('categoryRepository', dao.createCategoryRepository)
        .factory('transactionRepository', function() { return dao.transactionRepository; })
        .factory('ruleRepository', dao.createRuleRepository)
        .factory('syncManager', function() { return new SyncManager(); })
        .value('Translations', translations)
        .filter('translate', function(Translations, $locale, $cookies) {
            return function(input) {
                var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
                return Translations[language][input];
            };
        })
        .directive('i18nKey', directives.i18nKey)
        .directive('bankAccountNumber', directives.bankAccountNumber)
        .directive('typeaheadSource', directives.typeaheadSource)
        .directive('previousView', directives.previousView)
        .directive('barchart', directives.barchart)
        .directive('piechart', directives.piechart)
        .config(function($routeProvider){            
            $routeProvider.when('/category', {
                templateUrl: 'category.html'
            }).when('/import', {
                templateUrl: 'import.html',
                controller: 'ImportCtrl'
            }).when('/assign', {
                templateUrl: 'assign.html',
                controller: 'AssignCtrl'                
            }).when('/rules', {
                templateUrl: 'rules.html',
                controller: 'RulesCtrl'                
            }).when('/monthlyOverview', {
                templateUrl: 'monthlyOverview.html',
                controller: 'MonthlyOverviewCtrl'                
            }).when('/settings', {
                templateUrl: 'settings.html',
                controller: 'SettingsCtrl'
            }).when('/unsupported', {
                templateUrl: 'unsupportedBrowser.html'
            }).otherwise({
                templateUrl: 'assign.html',
                controller: 'AssignCtrl'                
            });
        })
        .run(function($location){
            $('.loadingPanel').hide();                                                                                                                                                                     
            if ( !Modernizr.indexeddb ){                                                                                                                                                                   
                $location.path('/unsupported');                                                                                                                                                            
            }
        });
        
        angular.bootstrap($('HTML'), ['nsoFinance']);
});