define('controllers', ['jquery', 'angular', 'angularCookies', 'dao', 'domain', 'translations', 'jquery.csv', 'modernizr', 'jqueryUI'], 
    function($, angular, angularCookies, dao, domain, translations, jqueryCsv, Modernizr) {
    
    var ACCOUNT_SELECTED_EVENT = 'accountSelected';
    var NOTIFICATION_EVENT = 'notification';
    var TRANSITION_END = 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd';
    var result = {};
    
    var Notification = function(type, message){
        this.type = type;
        this.message = message;    
    };
    
    result.RootCtrl = function($scope, $rootScope, $locale, $cookies, $window){
                
        $scope.languages = [];
        $scope.notifications = [];
           
        $scope.populateLanguages = function() {
            for(var key in translations){
                if ( key.length === 2){
                    $scope.languages.push(key);
                }
            }
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
        
    result.AccountListCtrl = function ($scope, $rootScope, $window, accountRepository) {    
        $scope.accounts = [];
        $scope.errorMessage = null;
        $scope.loading = false;
        $scope.selectedAccountType = domain.AccountType.ASSET;
        
        $scope.refresh = function() {
            $scope.loading = true;
            $window.console.log('Test:' + $scope.selectedAccountType);
            accountRepository.findAccountsByType($scope.selectedAccountType, function(results){                
                $window.console.log('Receiving results:' + $scope.selectedAccountType);
                $scope.accounts = results;
                $scope.loading = false;
                $scope.$apply();
            }, domain.Account.createFromDBO);
        };
        
        $scope.select = function(account) {
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, account);
        };
        
        $scope.add = function() {  
            var newAccount = new domain.Account($scope.selectedAccountType, '');
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, newAccount);
            $scope.accounts.push(newAccount);
        };
        
        $scope.remove = function(account) {
            accountRepository.remove(account.id, function() {
                var selectedIndex =  $scope.accounts.indexOf(account);
                $scope.accounts.splice(selectedIndex, 1);                
                $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, (selectedIndex-1) < $scope.accounts.length && (selectedIndex-1) >= 0? $scope.accounts[selectedIndex-1]: null);
                $scope.$apply();
            });
        };
        
    };
    
    result.AccountDetailCtrl = function ($scope, $rootScope, $window, $timeout, $cookies, $locale, accountRepository) {              
        
        $scope.$on(ACCOUNT_SELECTED_EVENT, function(event, account) {
            if ( account !== null ) {
                $('#infoMessageForm').alert('close');
            }
            $scope.alreadySubmitted = false;
            $scope.account = account;            
            $timeout(function(){ $('#inputAccountName').focus(); }, 100);
            //$scope.$apply();
        });
        
        $scope.save = function() {     
            $scope.alreadySubmitted = true;
            accountRepository.save($scope.account, function(){
                $scope.showSuccessMessage = true;
                $scope.$apply();
                $timeout(function() {
                    $scope.showSuccessMessage = false;
                    $scope.alreadySubmitted = false;
                }, 3000);                
            }, function(event) {
                if ( event.target !== undefined && event.target !== null && event.target.errorCode === 5){
                    var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
                    $scope.errorMessage = translations[selectedLanguage].duplicateAccountName;
                } else if ( event.target !== undefined && event.target !== null && event.target.webkitErrorMessage !== undefined) {
                    $scope.errorMessage = event.target.webkitErrorMessage;
                }
                $scope.alreadySubmitted = false;
                $scope.$apply();
            });
        };
        
        $scope.alreadySubmitted = false;
                        
        $scope.account = null;
        
        $scope.showSuccessMessage = false;    
    };
    
    result.ImportCtrl = function($scope, $locale, $cookies, $timeout, transactionRepository, $window) {
        
        $scope.delimiter = ';';
        $scope.escaper = '\\';
        $scope.dateFormat = 'dd/MM/yyyy';
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
                        var total = $scope.firstRowIsHeader ? data.length - 1 : data.length;
                        $scope.saveProgress = ($scope.savedTransactionCount * 100 ) / total;
                        $window.console.log('transaction:' + $scope.savedTransactionCount + ', length: ' + total + ', percent: ' + $scope.saveProgress);
                        $scope.$apply();
                    };
                    var errorCallback = function() { window.alert('Error saving transaction: '); };
                    for( var rowIndex in data ) {
                        if ( rowIndex === "0" && $scope.firstRowIsHeader ) {
                            continue;
                        }
                        var row = data[rowIndex];
                        var transaction = new domain.Transaction(Date.parseExact(row[fieldToColumnIndexMap[domain.TransactionField.DATE.fieldName]], $scope.dateFormat).getTime(), 
                                                          parseFloat(row[fieldToColumnIndexMap[domain.TransactionField.AMOUNT.fieldName]]),
                                                          row[fieldToColumnIndexMap[domain.TransactionField.DESCRIPTION.fieldName]]);
                        transactionRepository.save(transaction, successCallback, errorCallback);
                    }
                };
                fileReader.onprogress = function(e) {
                    $scope.fileReadingProgress = (e.loaded * 100) / e.total;  
                    $scope.$apply();
                };
                fileReader.readAsText(file);
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
    
    result.AssignCtrl = function($scope, $window, $timeout, transactionRepository, accountRepository) {
        
        $scope.transactions = [];
        $scope.accounts = "[]";
        
        var selectedTransaction;        
        var creditAccountChooser;
        var debetAccountChooser;
        var selectedRow;
        
        $scope.init = function() {
            var accountNames = [];
            accountRepository.findAll(function(accounts) {
                for( var index in accounts ) {
                    accountNames.push(accounts[index].name);
                }
                $scope.$apply();
            });
            debetAccountChooser = $('#debetAccountChooser');
            debetAccountChooser.typeahead({updater: $scope.updateDebet, source: accountNames });
            debetAccountChooser.focus(function() { $timeout(function() { debetAccountChooser.select(); }, 0, false); } );
            debetAccountChooser.blur(function() { 
                if ( debetAccountChooser.val() === "" && selectedTransaction.debetAccount !== null ) { 
                    $scope.updateDebet(undefined); 
                }
            });
            creditAccountChooser = $('#creditAccountChooser');
            creditAccountChooser.typeahead({updater: $scope.updateCredit, source: accountNames });
            creditAccountChooser.focus(function() { $timeout(function() { creditAccountChooser.select(); }, 0, false); } );
            creditAccountChooser.blur(function() { 
                if ( creditAccountChooser.val() === "" && selectedTransaction.creditAccount !== null ) { 
                    $scope.updateCredit(undefined); 
                } 
            } );
            $scope.refresh();
        };
        
        $scope.refresh = function() {            
            transactionRepository.findTransactions(function(data) {
                    $scope.transactions = data;
                    $scope.$apply();
                });
        };
        
        $scope.selectRow = function(e){            
            var currentTarget = $(e.currentTarget);            
            if ( currentTarget[0] === creditAccountChooser.parents('.row-fluid')[0] ){
                return;
            }
            var previousSelectedTransaction;
            var rowIndex = parseInt(currentTarget.data('rowIndex'), 10);
            if ( rowIndex >= 0 && rowIndex < $scope.transactions.length) {
                previousSelectedTransaction = selectedTransaction;
                selectedTransaction = $scope.transactions[rowIndex];
            }
            var creditColumn = currentTarget.children().last();
            var debetColumn = currentTarget.children().last().prev();
            creditAccountChooser.val(creditColumn.text());
            debetAccountChooser.val(debetColumn.text());
            creditColumn.text("");
            debetColumn.text("");
            creditAccountChooser.detach().appendTo(creditColumn).show();
            debetAccountChooser.detach().appendTo(debetColumn).show();
            if ( selectedRow !== undefined && selectedRow !== null ) {                
                selectedRow.removeClass('active');
                if ( previousSelectedTransaction !== undefined && previousSelectedTransaction !== null ) {
                    selectedRow.children().last().text(previousSelectedTransaction.creditAccount !== undefined ? 
                        previousSelectedTransaction.creditAccount.name : '');
                    selectedRow.children().last().prev().text(previousSelectedTransaction.debetAccount !== undefined ? 
                        previousSelectedTransaction.debetAccount.name : '');                        
                }
            }
            currentTarget.addClass('active');
            selectedRow = currentTarget;            
        };
        
        $scope.updateDebet = function(item) {
            $timeout(function() {debetAccountChooser.val(item)}, 0, false);
            updateAccount(item, 'debetAccount');
        };
        
        $scope.updateCredit = function(item) {
            $timeout(function() {creditAccountChooser.val(item)}, 0, false);
            updateAccount(item, 'creditAccount');
        };
        
        var updateAccount = function(item, accountType){
            if ( selectedTransaction !== undefined && selectedTransaction !== null ) {
                if ( selectedTransaction[accountType] === undefined || selectedTransaction[accountType] === null) {
                    selectedTransaction[accountType] = {};
                }
                if ( item === null || item === undefined ) {
                    selectedTransaction[accountType] = item;
                } else {
                    selectedTransaction[accountType].name = item;
                }
                var updatedRow = selectedRow;
                transactionRepository.save(selectedTransaction, 
                    function() { $(updatedRow).on(TRANSITION_END, function() { $(updatedRow).delay(1500).removeClass('saved')} ).addClass('saved'); }, 
                    function() { $window.alert('Error');});
            }            
        };

    };
    
    result.RulesCtrl = function($scope, $timeout, $cookies, $locale, accountRepository, ruleRepository, $window) {
        
        $scope.fields = domain.TransactionField.values.slice(0);
        $scope.operators = domain.RuleOperator.values.slice(0);
        $scope.rule = new domain.Rule();
        $scope.rules;
        $scope.categories;
        var labelsToField = {};
        var labelsToOperator = {};
        var labelsToCategory = {};
        
        var populateLabelToObjectMap = function(objectValues, labelToObjectMap, field, needsTranslation) {
            for( var index in objectValues ) {
                var enumValue = objectValues[index];
                if ( field === undefined || field === null ) {
                    field = 'i18nKey';
                }
                var label = needsTranslation === undefined || needsTranslation === true ?  translate(enumValue[field], $cookies, $locale) : enumValue[field];
                labelToObjectMap[label] = enumValue; 
            }
            
        };
        
        $scope.init = function() {
            populateLabelToObjectMap(domain.TransactionField.values, labelsToField);
            populateLabelToObjectMap(domain.RuleOperator.values, labelsToOperator);
            var fieldNames = $scope.fields.map(function(field) { return translate(field.i18nKey, $cookies, $locale); });
            $('.ruleField INPUT').typeahead({ source: fieldNames, updater: onFieldSelected });
            
            var operatorNames = $scope.operators.map(function(operator) { return translate(operator.i18nKey, $cookies, $locale); });
            $('.ruleOperator INPUT').typeahead({ source: operatorNames, updater: onOperatorSelected });
            $timeout(refreshDragAndDropTargets, 0, false);
            var lazySearchItemsInDao = function(query, callback){ 
                var callbackWrapper = function(results){
                    populateLabelToObjectMap(results, labelsToCategory, 'name', false );
                    callback(results.map(function(category){ return category.name; }));
                };
                accountRepository.search(query, callbackWrapper, domain.Account.createFromDBO); 
            };
            $('.ruleCategory INPUT').typeahead({ source: lazySearchItemsInDao, updater: onCategorySelected });
            
            $('.sortable').sortable().disableSelection();
            ruleRepository.findAll(function(results) {
                    $scope.rules = results;
                    $scope.$apply();
                });
                
            accountRepository.findAll(function(results){
                $scope.categories = results;
                $scope.$apply();
            });
        };

        $scope.saveRule = function() {
            ruleRepository.save($scope.rule, function() {
                    $scope.rule = new domain.Rule();
                    $scope.$apply();
                }, function() { });
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
                onFieldSelected(draggedElement.text().trim());
            } else if ( draggedElement.parents('.operatorLabels').size() !== 0) {
                onOperatorSelected(draggedElement.text().trim());
            }
            draggedElement.draggable('option', 'revert', false); 
            draggedElement.detach().appendTo(event.target);
        };
        
        var onFieldSelected = function(item){
            $('.fieldLabels .label:contains("' + item + '")').detach().appendTo($('.ruleField'));
            //$scope.fields.splice($scope.fields.indexOf(labelsToField[item]), 1);
            $scope.$apply();  
            $scope.rule.field = labelsToField[item];
            $('.ruleOperator INPUT').focus();
        };
        
        var onOperatorSelected = function(item){            
            $('.operatorLabels .label:contains("' + item + '")').detach().appendTo($('.ruleOperator'));
            //$scope.operators.splice($scope.operators.indexOf(labelsToOperator[item]), 1);
            $scope.rule.operator = labelsToOperator[item];
            $scope.$apply();
            $('.ruleValue').focus();
        };
        
        var onCategorySelected = function(item){
            $('.ruleCategory .label').addClass(calculateClassName(labelsToCategory[item])).css('display', 'block').text(item);
            $scope.rule.category = { id: labelsToCategory[item].id, name: labelsToCategory[item].name };
//            $scope.fields.splice($scope.fields.indexOf(labelsToField[item]), 1);
//            $scope.$apply();  
//            $('.ruleOperator INPUT').focus();
        };
        
        var calculateClassName = function(category) {
            var className = "";
            if ( category.accountType === domain.AccountType.ASSET ) {
                className = 'label-info';
            } else if ( category.accountType === domain.AccountType.LIABILITY ) {
                className = 'label-warning';
            } else if ( category.accountType === domain.AccountType.EXPENSE ) {
                className = 'label-important';                
            } else if ( category.accountType === domain.AccountType.INCOME ) {
                className = 'label-success';                                
            }
            return className;            
        };
    };
    
    result.SettingsCtrl = function($scope, $window, transactionRepository) {
        $scope.removeAllTransactions = function() {
            transactionRepository.reset(function(){ 
                // TODO: Give feedback to user and issue a reload of webapp
            });
        };
    };
    
    var translate = function(key, $cookies, $locale) {
        var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
        return translations[selectedLanguage][key];
    };
    
    return result;
});