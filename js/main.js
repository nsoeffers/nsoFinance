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
        'spin'              : 'spin.min'
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
        'modernizr' : {
            exports: 'Modernizr'
        }
    }
});

require([ 'jquery', 'angular', 'angularCookies', 'bootstrap', 'translations', 'dao', 'domain', 'controllers', 'modernizr', 'jqueryUI',  'datejs', 'domReady'], 
        function($, angular, angularCookies, bootstrap, translations, dao, domain, controllers, Modernizr) {
    angular.module('nsoFinance', ['ngCookies'])
        .controller('RootCtrl', controllers.RootCtrl)
        .controller('CategoryListCtrl', controllers.CategoryListCtrl)
        .controller('CategoryDetailCtrl', controllers.CategoryDetailCtrl)
        .controller('SettingsCtrl', controllers.SettingsCtrl)        
        .controller('ImportCtrl', controllers.ImportCtrl)
        .controller('AssignCtrl', controllers.AssignCtrl)
        .controller('RulesCtrl', controllers.RulesCtrl)
        .factory('categoryRepository', dao.createCategoryRepository)
        .factory('transactionRepository', dao.createTransactionRepository)
        .factory('ruleRepository', dao.createRuleRepository)
        .value('Translations', translations)
        .filter('translate', function(Translations, $locale, $cookies) {
            return function(input) {
                var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
                return Translations[language][input];
            };
        })
        .directive('i18nKey', function(Translations,$locale, $cookies){ 
            return function(scope, elm, attrs){
                var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
                elm.text(Translations[language][attrs.i18nKey]);
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
        .directive('typeaheadSource', function() {
            return function(scope, element, attrs){                
                $(element).typeahead({source: scope[attrs.typeaheadSource], updater: scope[attrs.typeaheadUpdater]});
            };
        })
        .directive('previousView', function($window, $timeout) {
            return {
                priority: 1,
                link: function(scope, element, attr) {
                    scope.$on('$routeChangeSuccess', update);
                    
                    function populatePreviousView(){
                        $('div[previous-view]').html('');
                        $('div[ng-view]').contents().detach().appendTo($('div[previous-view]'));
                        $('div[previous-view]').addClass('aboutToNavigate');
                        $('div[ng-view]').addClass('aboutToNavigate');
                    }
                    
                    function startNavigationAnimation(){
                        $('div[previous-view]').removeClass('aboutToNavigate');
                        $('div[ng-view]').removeClass('aboutToNavigate');                        
                    }
                    
                    function update(rootScope, current, previous) {
                        if ( previous !== undefined && previous !== null 
                                && current.locals.$template === previous.locals.$template ) {
                            return;
                        }
                        populatePreviousView();
                        $timeout(startNavigationAnimation, 0, false);
                    }
                }
            };
        })
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
        .run(function($location) {            
            $('.loadingPanel').hide();
            if ( !Modernizr.indexeddb ){
                $location.path('/unsupported');
            }
        });
        
        angular.bootstrap($('HTML'), ['nsoFinance']);
});