define('directives', ['goog!visualization,1,packages:[corechart]'], function(g) {
    var directives = {};
    
    var drawChart = function(element, chart, chartData, title){
        if ( chartData === undefined || chartData === null || chartData.length === 0 ){
            return;
        }
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows(chartData);
        
        var numberFormat = new google.visualization.NumberFormat({ fractionDigits: 2 });
        numberFormat.format(data, 1);

        var width = element[0].offsetWidth;
        // Set chart options
        var options = {'title': title,
                       'width':width,
                       'height':300, 
                       'legend': {position: 'none'},
                       'vAxis': {minValue: 0}};

        // Instantiate and draw our chart, passing in some options.
        chart.draw(data, options);
    };

    directives.i18nKey = function(Translations,$locale, $cookies, $interpolate, $window){ 
        return { 
            
            compile: function(elm, attrs){
                var language = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id;
                elm.text(Translations[language][attrs.i18nKey]);
            }
        }; 
    };
    
    directives.bankAccountNumber = function(){
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
    };
    
    directives.barchart = function() {
        return { 
            restrict: 'E',
            replace: true,
            template: '<div></div>',
            link: function(scope, element, attrs){
                scope.$watch(attrs.chartData, function() {
                    var chart = new google.visualization.ColumnChart(element[0]);
                    drawChart(element, chart, scope[attrs.chartData], scope[attrs.chartTitle]);
                });
            }
        };
    };
   
    directives.piechart = function() {
        return { 
            restrict: 'E',
            replace: true,
            template: '<div></div>',
            link: function(scope, element, attrs){
                scope.$watch(attrs.chartData, function() {
                    var chart = new google.visualization.PieChart(element[0]);
                    drawChart(element, chart, scope[attrs.chartData], scope[attrs.chartTitle]);
                });
            }
        };
    };
   
    directives.typeaheadSource = function() {
        return function(scope, element, attrs){
            scope.$watch(attrs.typeaheadSource, function () {
                var items = scope[attrs.typeaheadSource];
                var callback = scope[attrs.typeaheadUpdater];
                if ( attrs.mapper !== undefined && attrs.mapper !== null 
                        && scope[attrs.mapper] !== undefined && scope[attrs.mapper] !== null){
                    var labelToItemMap = {};
                    items = items.map(function(item) {
                        var label = scope[attrs.mapper](item);
                        labelToItemMap[label] = item;
                        return label;
                    });
                    callback = function(selectedLabel) {
                        scope.$apply(function() { scope[attrs.typeaheadUpdater](labelToItemMap[selectedLabel]); });
                    };
                }
                var enhancedSource = function(query, callback){                    
                    var typeahead = callback(items);
                    if ( typeahead.shown === false ) {
                        $(this.$element).parent().addClass('noMatch');
                    } else {
                        $(this.$element).parent().removeClass('noMatch');
                    }
                };
                var typeahead = $(element).typeahead();
                typeahead.data('typeahead').source = enhancedSource;
                typeahead.data('typeahead').updater = callback;
            }, true);
        };
    };

    directives.previousView = function($window, $timeout) {
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
    };
        
    return directives;
});