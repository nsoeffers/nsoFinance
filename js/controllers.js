define('controllers', ['jquery', 'angular', 'angularCookies', 'dao', 'domain', 'translations', 'jquery.csv', 'modernizr', 'jqueryUI'], 
    function($, angular, angularCookies, dao, domain, translations, jqueryCsv, Modernizr) {
    
    var ACCOUNT_SELECTED_EVENT = 'accountSelected';
    var NOTIFICATION_EVENT = 'notification';
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
    
    result.ImportCtrl = function($scope, $locale, $cookies, $timeout, transactionRepository) {
        
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
                        $scope.saveProgress = ($scope.savedTransactionCount * 100 ) / data.length;
                        $scope.$apply();
                    };
                    var errorCallback = function() { window.alert('Error saving transaction: '); };
                    for( var rowIndex in data ) {
                        var row = data[rowIndex];
                        var transaction = new domain.Transaction(Date.parseExact(row[fieldToColumnIndexMap[domain.TransactionField.DATE.fieldName]], $scope.dateFormat), 
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
    
    result.SettingsCtrl = function($scope, $window, transactionRepository) {
        $scope.removeAllTransactions = function() {
            transactionRepository.reset(function(){ 
                
            });
        };
    };
    
    var translate = function(key, $cookies, $locale) {
        var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
        return translations[selectedLanguage][key];
    };
    
    return result;
});