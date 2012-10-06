define('controllers', ['jquery', 'angular', 'angularCookies', 'dao', 'domain', 'translations', 'jquery.csv', 'modernizr'], 
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
        
    result.AccountListCtrl = function ($scope, $rootScope, $window, Dao) {    
        $scope.accounts = [];
        $scope.errorMessage = null;
        $scope.loading = false;
        $scope.selectedAccountType = domain.AccountType.ASSET;
        
        $scope.refresh = function() {
            $scope.loading = true;
            $window.console.log('Test:' + $scope.selectedAccountType);
            Dao.findAccountsByType($scope.selectedAccountType, function(results){                
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
            Dao.remove(account.id, function() {
                var selectedIndex =  $scope.accounts.indexOf(account);
                $scope.accounts.splice(selectedIndex, 1);                
                $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, (selectedIndex-1) < $scope.accounts.length && (selectedIndex-1) >= 0? $scope.accounts[selectedIndex-1]: null);
                $scope.$apply();
            });
        };
        
    };
    
    result.AccountDetailCtrl = function ($scope, $rootScope, $window, $timeout, $cookies, Dao) {              
        
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
            Dao.save($scope.account, function(){
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
    
    result.ImportCtrl = function($scope) {
        
        $scope.selectedFile = null;
        $scope.csvData = null;
        $scope.unmappedFields = ["dateField", "amountField"];
                
        $scope.chooseFile = function() {
            $('input[id=csvFile]')[0].addEventListener('change', $scope.onFileSelected, false);
            $('input[id=csvFile]').click();
        };
        
        $scope.onFileSelected = function(e) {
            var file = null;
            if ( e.target.files !== undefined && e.target.files !== null && e.target.files.length === 1 ) {
                file = e.target.files[0];
            }
            if (file !== null ) {
                var fileReader = new FileReader();
                fileReader.onload = function(e){
                    $scope.csvData = $.csv.toArrays(e.target.result, { separator: ';', escaper: '\\' });
                    $scope.$apply();
                };
                fileReader.readAsText(file.slice(0, 3*1024));
            }
            $scope.selectedFile = file === null ? null : file.name;
            $scope.$apply();
        };
    };
    
    return result;
});