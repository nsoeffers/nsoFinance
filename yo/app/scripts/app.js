'use strict';

angular.module('yoApp', ['ngCookies'])
  .config(function ($routeProvider) {
    $routeProvider.when('/category', {
        templateUrl: 'views/category.html'
    }).when('/import', {
        templateUrl: 'views/import.html',
        controller: 'ImportCtrl'
    }).when('/assign', {
        templateUrl: 'views/assign.html',
        controller: 'AssignCtrl'
    }).when('/rules', {
        templateUrl: 'views/rules.html',
        controller: 'RulesCtrl'
    }).when('/monthlyOverview', {
        templateUrl: 'views/monthlyOverview.html',
        controller: 'MonthlyOverviewCtrl'
    }).when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
    }).when('/unsupported', {
        templateUrl: 'unsupportedBrowser.html'
    }).otherwise({
        templateUrl: 'views/assign.html',
        controller: 'AssignCtrl'
    });
})
.run(function($location){
    $('.loadingPanel').hide();
    if ( !Modernizr.indexeddb ){
        $location.path('/unsupported');
    }
});
