define('directives', function() {
    var directives = {};
    
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