define('controllers', ['jquery', 'angular', 'angularCookies', 'dao', 'domain', 'translations', 'jquery.csv', 'modernizr', 'moment', 'spin', 'jqueryUI'], 
    function($, angular, angularCookies, dao, domain, translations, jqueryCsv, Modernizr, moment, Spinner) {
    
    var CATEGORY_SELECTED_EVENT = 'categorySelected';
    var CATEGORY_SAVED_EVENT = 'categorySaved';
    var RULE_SAVED_EVENT = 'ruleSaved';
    var TRANSACTIONS_MAPPED = "transactionsMapped";
    var FIELD_SELECTED_EVENT = 'fieldSelected';
    var NOTIFICATION_EVENT = 'notification';
    var TRANSITION_END = 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd';
    var result = {};
    
    var Notification = function(type, message){
        this.type = type;
        this.message = message;    
    };
    
    result.RootCtrl = function($scope, $rootScope, $locale, $cookies, $window, categoryRepository){
                
        $scope.languages = [];
        $scope.notifications = [];
        $rootScope.categories = [];
        
        $rootScope.mapCategoryToLabel = function(category) {
            if ( category === undefined || category === null ){
                return "";
            }
            return category.name;
        };        

           
        $scope.init = function() {
            for(var key in translations){
                if ( key.length === 2){
                    $scope.languages.push(key);
                }
            }
            categoryRepository.findAll(function(categories){
                $rootScope.categories = categories;
            });            
        };
        
        $scope.getLanguageSelectedClass = function(language){
            var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
            return (selectedLanguage == language? 'active' : '');
        };
        
        $scope.setLanguage = function(language){
            $cookies.languagePreference = language;
            $window.location.reload();
        };
        
        $scope.$on(NOTIFICATION_EVENT, function(event, notification){
            $scope.notifications.push(notification);
            $scope.$apply();
        });
    };
        
    result.CategoryListCtrl = function ($scope, $rootScope, $window, categoryRepository) {    
        $scope.categories = [];
        $scope.errorMessage = null;
        $scope.loading = false;
        $scope.selectedCategoryType = domain.CategoryType.ASSET;
        
        $scope.refresh = function() {
            $scope.loading = true;
            $scope.$emit(CATEGORY_SELECTED_EVENT, null);
            categoryRepository.findCategoriesByType($scope.selectedCategoryType, function(results){                
                $scope.categories = results;
                $scope.loading = false;
                $scope.$apply();
            }, domain.Category.createFromDBO);
        };
        
        $scope.select = function(category) {
            $scope.$emit(CATEGORY_SELECTED_EVENT, category);
        };
        
        $scope.add = function() {  
            var newCategory = new domain.Category($scope.selectedCategoryType, '');
            $scope.$emit(CATEGORY_SELECTED_EVENT, newCategory);
            $scope.categories.push(newCategory);
        };
        
        $scope.remove = function(category) {
            categoryRepository.remove(category.id, function() {
                var selectedIndex =  $scope.categories.indexOf(category);
                $scope.categories.splice(selectedIndex, 1);                
                $rootScope.$broadcast(CATEGORY_SELECTED_EVENT, (selectedIndex-1) < $scope.categories.length && (selectedIndex-1) >= 0? $scope.categories[selectedIndex-1]: null);
                $scope.$apply();
            });
        };
        
    };
    
    result.CategoryDetailCtrl = function ($scope, $rootScope, $window, $timeout, $cookies, $locale, categoryRepository) {              
        
        $scope.$parent.$parent.$on(CATEGORY_SELECTED_EVENT, function(event, category) {
            if ( category !== null ) {
                $('#infoMessageForm').alert('close');
            }
            $scope.alreadySubmitted = false;
            $scope.category = category;            
            $timeout(function(){ $('#inputCategoryName').focus(); }, 100);
            //$scope.$apply();
        });
        
        $scope.save = function() {     
            $scope.alreadySubmitted = true;
            categoryRepository.save($scope.category, function(savedCategory){
                $rootScope.categories.push(savedCategory);
                $scope.showSuccessMessage = true;
                $scope.$emit(CATEGORY_SAVED_EVENT, savedCategory);                
                $scope.$apply();
                $timeout(function() {
                    $scope.showSuccessMessage = false;
                    $scope.alreadySubmitted = false;
                }, 3000);                
            }, function(event) {
                if ( event.target !== undefined && event.target !== null && event.target.errorCode === 5){
                    var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
                    $scope.errorMessage = translations[selectedLanguage].duplicateCategoryName;
                } else if ( event.target !== undefined && event.target !== null && event.target.webkitErrorMessage !== undefined) {
                    $scope.errorMessage = event.target.webkitErrorMessage;
                }
                $scope.alreadySubmitted = false;
                $scope.$apply();
            });
        };
        
        $scope.alreadySubmitted = false;
                        
        $scope.category = null;
        
        $scope.showSuccessMessage = false;    
    };
    
    result.ImportCtrl = function($scope, $locale, $cookies, $timeout, transactionRepository, ruleRepository, $window, $rootScope) {
        
        $scope.delimiter = ';';
        $scope.escaper = '\\';
        $scope.dateFormat = 'dd/MM/yyyy';
        $scope.thousandsSeparator = '.';
        $scope.decimalSeparator = ',';
        $scope.selectedFile = null;
        $scope.csvData = null;
        $scope.unmappedFields = domain.TransactionField.values;
        $scope.csvColumnToField = [];
        $scope.importStarted = false;
        $scope.savedTransactionCount = 0;
        $scope.fileReadingProgress = 0;
        $scope.saveProgress = 0;   
        $scope.firstRowIsHeader = true;
        
        var file = null;
        var rules = [];
        
        $scope.init = function() {
            ruleRepository.findAll(function(result){
                rules = result;
            });
        };
                        
        $scope.chooseFile = function() {
            $('input[id=csvFile]')[0].addEventListener('change', $scope.onFileSelected, false);
            $('input[id=csvFile]').click();
        };
        
        $scope.onFieldDropped = function(event, ui){
            $(event.srcElement).draggable('option', 'revert', false); 
            $(event.srcElement).hide(); 
            var selectedColumn = $('.tablePreview TH').index($(event.target));
            var selectedUnmappedIndex = $('.labelsArea SPAN.label').index($(event.srcElement));
            var selectedTransactionField = null;
            if ( selectedUnmappedIndex === -1 ){
                selectedTransactionField = $scope.csvColumnToField[$('.tablePreview TH').index($(event.srcElement).parent())];
                $scope.csvColumnToField[$('.tablePreview TH').index($(event.srcElement).parent())] = undefined;
            } else {
                selectedTransactionField  = $scope.unmappedFields[selectedUnmappedIndex];
                $scope.unmappedFields.splice($('.labelsArea SPAN.label').index($(event.srcElement)), 1);
            }
            $scope.csvColumnToField[selectedColumn] = selectedTransactionField;
            refreshMappingReadyStatus();
            $scope.$apply();
            refreshDragAndDropTargets();
        };
        
        $scope.onFieldDragged = function(event, ui){
        };

        
        $scope.onFileSelected = function(e) {
            if ( e.target.files !== undefined && e.target.files !== null && e.target.files.length === 1 ) {
                file = e.target.files[0];
            }
            if (file !== null ) {
                var fileReader = new FileReader();
                fileReader.onload = function(e){
                    $scope.csvData = $.csv.toArrays(e.target.result, { separator: $scope.delimiter, escaper: $scope.escaper });
                    if ( !$scope.firstRowIsHeader ) {
                        var headerRow = [];
                        for( var columnIndex in $scope.csvData[0] ) {
                            headerRow.push(translate('column', $cookies, $locale) + columnIndex);
                        }
                        $scope.csvData.unshift(headerRow);
                    }
                    autoMap();
                    $scope.$apply();
                    refreshDragAndDropTargets();
                };
                // Only process the first 3kb to construct a preview
                fileReader.readAsText(file.slice(0, 3*1024));
            }
            $scope.selectedFile = file === null ? null : file.name;
            $scope.$apply();
        };
        
        $scope.continueImport = function() {
            $scope.importStarted = true;
            if (file !== null ) {
                var fieldToColumnIndexMap = {};
                for( var columnIndex in $scope.csvColumnToField ) {
                    fieldToColumnIndexMap[$scope.csvColumnToField[columnIndex].fieldName] = columnIndex;
                }
                var fileReader = new FileReader();
                fileReader.onload = function(e){
                    var data = $.csv.toArrays(e.target.result, { separator: ';', escaper: '\\' });
                    var successCallback = function() { 
                        $scope.savedTransactionCount++; 
                        var total = $scope.firstRowIsHeader ? data.length - 2 : data.length - 1;
                        $scope.saveProgress = ($scope.savedTransactionCount * 100 ) / total;
                        if ( $scope.saveProgress === 100 ){
                            $timeout(function() { $($window.document.body).animate({ scrollTop: $window.document.body.scrollHeight+20}); }, 200);
                        }
                        $window.console.log('transaction:' + $scope.savedTransactionCount + ', length: ' + total + ', percent: ' + $scope.saveProgress);
                        $scope.$apply();
                    };
                    var errorCallback = function() { window.alert('Error saving transaction: '); };
                    for( var rowIndex in data ) {
                        if ( rowIndex === "0" && $scope.firstRowIsHeader ) {
                            continue;
                        }
                        var row = data[rowIndex];
                        var amount = row[fieldToColumnIndexMap[domain.TransactionField.AMOUNT.fieldName]];
                        amount = amount.replace($scope.thousandsSeparator, '');
                        amount = amount.replace($scope.decimalSeparator, '.');
                        var transaction = new domain.Transaction(Date.parseExact(row[fieldToColumnIndexMap[domain.TransactionField.DATE.fieldName]], $scope.dateFormat).getTime(), 
                                                          parseFloat(amount),
                                                          row[fieldToColumnIndexMap[domain.TransactionField.DESCRIPTION.fieldName]]);
                        for(var index in rules){
                            rules[index].process(transaction);
                        }
                        transactionRepository.save(transaction, successCallback, errorCallback);
                    }
                };
                fileReader.onprogress = function(e) {
                    $scope.fileReadingProgress = (e.loaded * 100) / e.total;  
                    $scope.$apply();
                };
//                fileReader.onload = function(e) {
//                    $scope.fileReadingProgress = 100;  
//                    $scope.$apply();                    
//                };
                fileReader.readAsText(file);
                $timeout(function() { $($window.document.body).animate({ scrollTop: $window.document.body.scrollHeight+20}); }, 200);
            }            
        };
        
        var refreshMappingReadyStatus = function() {
            $scope.mappingReady = true;
            for ( var index in $scope.unmappedFields ) {
                if ( $scope.unmappedFields[index].required ) {
                    $scope.mappingReady = false;
                }
            }
        };
        
        var refreshDragAndDropTargets = function() {
            $('.tablePreview TH .label').css('left', '0px');
            $('.tablePreview TH .label').css('top', '0px');
            $timeout(function(){
                $('.labelsArea .label').draggable('destroy');
                $('.tablePreview TH').droppable('destroy');
                $('.labelsArea .label').draggable({scope: 'Field', revert: true, containment: 'window',
                                                    drag: $scope.onFieldDragged, opacity: 0.5 });
                $('.tablePreview TH .label').draggable({scope: 'Field', revert: true, containment: 'window',
                                                    drag: $scope.onFieldDragged, opacity: 0.5});                                                
                $('.tablePreview TH')
                    .filter(function() { return !($(this).children().is('.label')); })
                    .droppable({scope: 'Field', hoverClass: 'dropFieldHover', 
                                drop: $scope.onFieldDropped}); 
            }, 200);
        };
        
        var autoMap = function() {
            if ( $scope.csvData === null || $scope.csvData === undefined || $scope.csvData.length <= 0 ) {
                return;
            }
            var fieldTranslations = {};
            for(var fieldIndex in domain.TransactionField.values) {
                var field = domain.TransactionField.values[fieldIndex];
                fieldTranslations[translate(field.i18nKey, $cookies, $locale)] = field;
            }
            for(var index in $scope.csvData[0]){
                if ( fieldTranslations[$scope.csvData[0][index]] !== undefined ) {
                    var indexInUnmappedFields = $scope.unmappedFields.indexOf(fieldTranslations[$scope.csvData[0][index]]);
                    if ( indexInUnmappedFields != -1 ) {
                        $scope.csvColumnToField[index] = fieldTranslations[$scope.csvData[0][index]];  
                        $scope.unmappedFields.splice(indexInUnmappedFields, 1);
                    }
                }
            }
            refreshMappingReadyStatus();
        };    
    };
    
    result.AssignCtrl = function($scope, $window, $timeout, $location, transactionRepository, categoryRepository, $rootScope) {
        
        $scope.transactions = null;
        
        // Configure sub views/presenters that are used in this view
        $scope.forbidCategoryAddition = true;
        $scope.forbidCategoryRemoval = true;
        $scope.hideCategoryDetailTitle = true;
        $scope.showCategoryTypeInDetailForm = true;
        
        var selectedTransaction;
        var creditCategoryChooser;
        var debetCategoryChooser;
        var selectedRow;
        var spinner;
        var creditSideSelected = null;    
        
        var hideRuleForm = function() {
            if ( $('#hiddenEditableFields #ruleForm').size() === 0 ) {
                $('#ruleForm').detach().appendTo($('#hiddenEditableFields'));
                $('#ruleForm INPUT').val('').html(null);
                $('#ruleForm .ruleField .label, #ruleForm .ruleOperator .label, #ruleForm .ruleCategory .label').detach();
            }        
        };
        
        var onPopupClosed = function(event, category) {
            if ( category === null || category === undefined ) {
                return;
            }
            if ( creditSideSelected ){
                $scope.updateCredit(category);
            } else {
                $scope.updateDebet(category);
            }
            $('#categoryBrowser').modal('hide');
            $('#categoryCreator').modal('hide');
        };
        
        $scope.$on(CATEGORY_SELECTED_EVENT, onPopupClosed);
        $scope.$on(CATEGORY_SAVED_EVENT, function(event, category) { 
            onPopupClosed(event, category);
        });
        $scope.$on(RULE_SAVED_EVENT, function(event, rule) { 
            hideRuleForm();            
        });
        $scope.$on(TRANSACTIONS_MAPPED, function(event){
             refreshStatistics();
             $('#creditCategoryChooser').parent().detach().appendTo($('#hiddenEditableFields'));
             $scope.refresh();
        });

        $scope.$on(FIELD_SELECTED_EVENT, function(event, selectedField, selectedRule) {
            if ( selectedTransaction !== undefined && selectedTransaction !== null 
                    || selectedField !== undefined && selectedField !== null ) {  
                selectedRule.value = selectedTransaction[selectedField.fieldName];
            }
        });

        $scope.setCreditSideSelected = function() {
            creditSideSelected = true;
        };
        
        $scope.setDebetSideSelected = function() {
            creditSideSelected = false;
        };
        
        $scope.addCreditCategory = function() {
            $scope.setCreditSideSelected();
            var newCategory = new domain.Category(domain.CategoryType.EXPENSE, creditCategoryChooser.val());
            $scope.$broadcast(CATEGORY_SELECTED_EVENT, newCategory);
        };
        
        $scope.addDebetCategory = function() {
            $scope.setDebetSideSelected();
            var newCategory = new domain.Category(domain.CategoryType.EXPENSE, debetCategoryChooser.val());
            $scope.$broadcast(CATEGORY_SELECTED_EVENT, newCategory);
        };
                
        $scope.init = function() {
            /*debetCategoryChooser = $('#debetCategoryChooser');
            debetCategoryChooser.focus(function() { $timeout(function() { debetCategoryChooser.select(); }, 0, false); } );
            debetCategoryChooser.blur(function() { 
                if ( debetCategoryChooser.val() === "" && selectedTransaction.debetAccount !== null ) { 
                    $scope.updateDebet(undefined); 
                }
            });*/
            creditCategoryChooser = $('#creditCategoryChooser');
            creditCategoryChooser.focus(function() { $timeout(function() { creditCategoryChooser.select(); }, 0, false); } );
            creditCategoryChooser.blur(function() { 
                if ( creditCategoryChooser.val() === "" && selectedTransaction.creditAccount !== null ) { 
                    $scope.updateCredit(undefined); 
                } 
            } );
            
            refreshStatistics();
            $scope.refresh();            
        };
        
        $scope.isActiveGranularity = function(granularity){
            return $location.search()[granularity] == true 
                || ($.isEmptyObject($location.search()) && granularity === 'month')? 'active' : '';
        };
        
        $scope.setIntervalGranularity = function(granularity) {
            $location.search(granularity);
            $scope.refresh();
        };
        
        $scope.refresh = function() {            
            spinner = new Spinner({lines: 10, width: 3, length: 7, hwaccel: true}).spin($('#waitForTransactions')[0]);
            
            var fromDate = moment().startOf('month').subtract('months', 2);
            var toDate = moment().startOf('month').subtract('months', 2).endOf('month');
            if ( $location.search().year === true ) {
                fromDate = moment().startOf('year');
                toDate = moment().endOf('year');
            } else if ( $location.search().all === true ) {
                fromDate = new Date(0);
                toDate = new Date(9999, 0, 1);
            }
            transactionRepository.findUntaggedTransactions(fromDate, toDate, function(data) {
                $scope.$apply(function(){
                    $scope.transactions = data;
                    spinner.stop();
                    $('#waitForTransactions').hide();
                })});
        };
        
        $scope.toggleRuleForm = function() {
            var ruleForm = $('#ruleForm');
            if ( ruleForm.parents('#hiddenEditableFields').size() === 1){
                ruleForm.detach().appendTo(selectedRow);    
                $timeout(function() { selectedRow.addClass("expanded");}, 0, false);
            } else {
                selectedRow.removeClass("expanded");
                $timeout(function() { ruleForm.detach().appendTo($('#hiddenEditableFields'));}, 500, false);
            }
        };
        
        $scope.selectRow = function(e){            
            var currentTarget = $(e.currentTarget);            
            if ( currentTarget[0] === creditCategoryChooser.parents('.row-fluid')[0] ){
                return;
            }
            hideRuleForm();
            var previousSelectedTransaction;
            var rowIndex = parseInt(currentTarget.data('rowIndex'), 10);
            if ( rowIndex >= 0 && rowIndex < $scope.transactions.length) {
                previousSelectedTransaction = selectedTransaction;
                selectedTransaction = $scope.transactions[rowIndex];
            }
            var creditColumn = currentTarget.children().last().prev();
            //var debetColumn = currentTarget.children().last().prev().prev();
            creditCategoryChooser.val(creditColumn.text());
            //debetCategoryChooser.val(debetColumn.text());
            creditCategoryChooser.parent().removeClass('noMatch');
            //debetCategoryChooser.parent().removeClass('noMatch');
            creditColumn.text("");
            //debetColumn.text("");
            creditCategoryChooser.parent().detach().appendTo(creditColumn).show();
            //debetCategoryChooser.parent().detach().appendTo(debetColumn).show();
            if ( selectedRow !== undefined && selectedRow !== null ) {                
                selectedRow.removeClass('active');
                selectedRow.removeClass('expanded');
                if ( previousSelectedTransaction !== undefined && previousSelectedTransaction !== null ) {
                    selectedRow.children().last().prev().html(previousSelectedTransaction.creditAccount !== undefined ? 
                        '<span class="label ' + calculateClassNameForCategory(previousSelectedTransaction.creditAccount) + '">' 
                        + previousSelectedTransaction.creditAccount.name + '</span>': '');
                    /*selectedRow.children().last().prev().prev().html(previousSelectedTransaction.debetAccount !== undefined ? 
                        '<span class="label ' + calculateClassNameForCategory(previousSelectedTransaction.debetAccount) + '">' 
                        + previousSelectedTransaction.debetAccount.name + '</span>': '');*/
                }
            }
            currentTarget.addClass('active');
            selectedRow = currentTarget;        
            $timeout(function() { 
                /*if ( selectedTransaction.debetAccount === null || selectedTransaction.debetAccount === undefined ) {
                    debetCategoryChooser.focus();
                } else*/ if ( selectedTransaction.creditAccount === null || selectedTransaction.creditAccount === undefined ) {
                    creditCategoryChooser.focus();
                }
            }, 0);
        };
        
        $scope.updateDebet = function(item) {
            updateAccount(item, 'debetAccount', debetCategoryChooser);
        };
        
        $scope.updateCredit = function(category) {
            updateAccount(category, 'creditAccount', creditCategoryChooser);
        };
        
        $scope.calculateClassName = calculateClassNameForCategory;
        
        var refreshStatistics = function() {
            transactionRepository.getStatistics(function(statistics) {
               $scope.$apply(function() { 
                   $scope.statistics = statistics;
               });
            });
        };
        
        var updateAccount = function(item, categoryType, field){
            $timeout(function() {field.val($rootScope.mapCategoryToLabel(item))}, 0, false);
            if ( selectedTransaction !== undefined && selectedTransaction !== null ) {
                if ( selectedTransaction[categoryType] === undefined || selectedTransaction[categoryType] === null) {
                    selectedTransaction[categoryType] = {};
                }
                selectedTransaction[categoryType] = item;
                var updatedRow = selectedRow;
                transactionRepository.save(selectedTransaction, 
                    function() { 
                        $(updatedRow).on(TRANSITION_END, function() { $(updatedRow).delay(1500).removeClass('saved')} ).addClass('saved'); 
                    }, 
                    function() { $window.alert('Error');});
            }            
        };
        
    };
    
    result.RulesCtrl = function($scope, $timeout, $cookies, $locale, ruleRepository, transactionRepository, $window) {
        
        $scope.fields = domain.TransactionField.values.slice(0);
        $scope.operators = domain.RuleOperator.values.slice(0);
        $scope.rule = new domain.Rule();
        $scope.rules = [];
        
        $scope.init = function() {
            $timeout(refreshDragAndDropTargets, 0, false);
            
            ruleRepository.findAll(function(results) {
                    $scope.rules = results;
                    $scope.$apply();
                });  
            $timeout(function(){
                $('.categoryLabels.labelsArea .label').draggable({scope: 'Category', revert: true, containment: 'window',
                    drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });                                    
                $('#newRule .ruleCategory').droppable({scope: 'Category', hoverClass: 'dropCategoryHover', 
                    drop: onLabelDropped});
            }, 0 );
        };
        
        $scope.mapEnumToLabel = function(enumValue) {
            if ( enumValue === undefined || enumValue === null ) {
                return undefined;
            }
            if ( enumValue.i18nKey !== undefined || enumValue.i18nKey !== null ) {
                return translate(enumValue.i18nKey, $cookies, $locale);
            }            
            return enumValue;
        };
                
        $scope.saveRule = function() {
            var process = $scope.rule.process;
            var compare = $scope.rule.operator.compare;
            delete $scope.rule.process;
            delete $scope.rule.operator.compare;
            ruleRepository.save($scope.rule, function(savedRule) {
                    savedRule.process = process;
                    savedRule.operator.compare = compare;
                    $scope.$emit(RULE_SAVED_EVENT, savedRule);
                    $scope.ruleToProcess = savedRule;
                    $scope.rules.push(savedRule);
                    $scope.rule = new domain.Rule();
                    $scope.$apply();
                    $timeout(processUnmappedTransactions, 0, false);
                }, function() { });
        };
                
        var processUnmappedTransactions = function() {
            transactionRepository.findUntaggedTransactions(new Date(0), new Date(2999, 0, 1), function(data){
                var mappedTransactionCount = 0;
                for(var i = data.length - 1; i >= 0; i--){                    
                    if ( $scope.ruleToProcess.process(data[i]) === true ) {
                        mappedTransactionCount++;
                        transactionRepository.save(data[i], function(entity) { 
                            mappedTransactionCount--;
                            $window.console.log('Saved transaction' + JSON.stringify(entity));
                        });
                    }
                }
                var checkNewlyMappedTransactions = function() {
                    if ( mappedTransactionCount === 0 ) {
                        $scope.$emit(TRANSACTIONS_MAPPED);
                    } else {
                        $timeout(checkNewlyMappedTransactions, 0, false);
                    }
                };
                $timeout(checkNewlyMappedTransactions, 0, false);
                
            });
        };
        
        var refreshDragAndDropTargets = function() {
            $('.fieldLabels.labelsArea .label').draggable({scope: 'Field', revert: true, containment: 'window',
                                    drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });
            $('.operatorLabels.labelsArea .label').draggable({scope: 'Operator', revert: true, containment: 'window',
                                    drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });
            $('#newRule .ruleField').droppable({scope: 'Field', hoverClass: 'dropFieldHover', 
                                    drop: onLabelDropped}); 
            $('#newRule .ruleOperator').droppable({scope: 'Operator', hoverClass: 'dropOperatorHover', 
                                    drop: onLabelDropped}); 
        };       
        
        var onLabelDropped = function(event, ui) {
            var draggedElement = $(event.srcElement);
            if ( draggedElement.parents('.fieldLabels').size() !== 0) {
                $scope.onFieldSelected(draggedElement.text().trim());
            } else if ( draggedElement.parents('.operatorLabels').size() !== 0) {
                $scope.onOperatorSelected(draggedElement.text().trim());
            } else if ( draggedElement.parents('.categoryLabels').size() !== 0) {
                $scope.onCategorySelected(draggedElement.text().trim());                
            }
            draggedElement.draggable('option', 'revert', false); 
            draggedElement.detach().appendTo(event.target);
        };
        
        $scope.onFieldSelected = function(field){
            $('.ruleField').append('<span class="label label-important">' + $scope.mapEnumToLabel(field) + '</span');
            $scope.rule.field = field;
            $('.ruleOperator INPUT').focus();
            $scope.$emit(FIELD_SELECTED_EVENT, $scope.rule.field, $scope.rule);
        };
        
        $scope.onOperatorSelected = function(operator){            
            $('.ruleOperator').append('<span class="label label-inverse">' + $scope.mapEnumToLabel(operator) + '<span>');
            $scope.rule.operator = angular.copy(operator);
            $('.ruleValue').focus();
        };
        
        $scope.onCategorySelected = function(selectedCategory){
            $scope.rule.category = selectedCategory;
            $('.ruleCategory').append('<span class="label ' + $scope.calculateClassName(selectedCategory) + '">' + $scope.mapCategoryToLabel(selectedCategory) + '</span>');
        };
        
        $scope.removeRule = function(){
            ruleRepository.remove(selectedRule.id, 
                function() {
                    var selectedIndex =  $scope.rules.indexOf(selectedRule);
                    $scope.rules.splice(selectedIndex, 1);
                    $scope.$apply();
                }, 
                function() {/* TODO: Error handling*/});              
        };
        
        $scope.removeRuleAndAssignments = function(){
            transactionRepository.unassignAllTransactionsMappedBy(selectedRule, $scope.removeRule);
        };
        
        var selectedRule = null;
        
        $scope.selectRule = function(rule) {
            selectedRule = rule;
        };
        
        $scope.calculateClassName = calculateClassNameForCategory;
    };
    
    result.MonthlyOverviewCtrl = function($scope, $cookies, $locale, transactionRepository){
        
        $scope.categories = {};
        $scope.periods = [];
        $scope.statisticsPerPeriod = {};
        $scope.chartData = [];
        
        $scope.categories = {};
        $scope.periods = [];
        $scope.statisticsPerPeriod = {};
        
        $scope.init = function() {
            var period = moment(new Date(2012, 9, 1));
            var processStatistics = function(result, year, month) {
                $scope.statisticsPerPeriod[moment([year, month]).format('MM-YYYY')] = result;
                for(var category in result){
                    $scope.categories[category] = category;
                }
                $scope.$apply();
            };
            for ( var i = 0; i < 6; i++ ){
                period = period.subtract('months', 1);
                var periodLabel = period.format('MM-YYYY');
                $scope.periods.push(periodLabel);
                transactionRepository.getMonthlyStatistics(period.year(), period.month(), processStatistics);
            }
        };
        
        $scope.selectCategory = function(categoryName){
            var newChartData = [];
            $scope.chartTitle = translate('category_evolution_chart_title', $cookies, $locale) + categoryName;
            for(var periodIndex in $scope.periods){
                var period = $scope.periods[periodIndex];
                var value = $scope.statisticsPerPeriod[period][categoryName];
                if ( value !== undefined){
                    newChartData.push([period, Math.abs(value)]);
                }
            }
            $scope.chartData = newChartData;
            $scope.showBarChart = true;
        };
        
        $scope.selectPeriod = function(period){
            var newChartData = [];
            $scope.chartTitle = translate('category_evolution_chart_title', $cookies, $locale) + categoryName;
            if ( $scope.statisticsPerPeriod[period]){
                for(var categoryIndex in $scope.categories ){
                    var categoryName = $scope.categories[categoryIndex];
                    var value = $scope.statisticsPerPeriod[period][categoryName];
                    newChartData.push([categoryName, Math.abs(value)]);
                }
            }
            $scope.chartData = newChartData;
            $scope.showBarChart = false;
        };
    };
    
    result.SettingsCtrl = function($scope, $window, transactionRepository) {
        $scope.removeAllTransactions = function() {
            transactionRepository.reset(function(){ 
                // TODO: Give feedback to user and issue a reload of webapp
                $window.location.reload();
            });
        };
        
        $scope.removeAllData = function() {
            transactionRepository.resetAll(function(){ 
                // TODO: Give feedback to user and issue a reload of webapp
                $window.location.reload();
            });
        };

    };
    
    var translate = function(key, $cookies, $locale) {
        var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
        return translations[selectedLanguage][key];
    };
    
    var calculateClassNameForCategory = function(category) {
        if ( category === null || category === undefined ) {
            return "";
        }
        var className = "";
        if ( category.type === domain.CategoryType.ASSET ) {
            className = 'label-info';
        } else if ( category.type === domain.CategoryType.LIABILITY ) {
            className = 'label-warning';
        } else if ( category.type === domain.CategoryType.EXPENSE ) {
            className = 'label-important';                
        } else if ( category.type === domain.CategoryType.INCOME ) {
            className = 'label-success';                                
        }
        return className;            
    };
    
    return result;
});