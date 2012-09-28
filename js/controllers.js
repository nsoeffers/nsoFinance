define('controllers', ['angular', 'dao', 'domain'], function(angular, dao, domain) {
    
    var ACCOUNT_SELECTED_EVENT = 'accountSelected';
    var result = {};
        
    result.AccountListCtrl = function ($scope, $rootScope, $window, Dao) {    
        $scope.accounts = [];
        
        $scope.refresh = function() {
            Dao.retrieveAll(function(results){
                $scope.accounts = results;
                $scope.$apply();
            }, domain.Account.createFromDBO);
        };
        
        $scope.select = function(account) {
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, account);
        };
        
        $scope.add = function() {  
            var newAccount = new domain.Account(domain.AccountType.ASSET, '');
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, newAccount);
            $scope.accounts.push(newAccount);
        };
        
        $scope.remove = function(account) {
            Dao.remove(account.id, function() {
                $scope.accounts.splice($scope.accounts.indexOf(account), 1);
                $scope.$apply();
            });
        };
        
    };
    
    result.AccountDetailCtrl = function ($scope, $window, $timeout, Dao) {              
        
        $scope.$on(ACCOUNT_SELECTED_EVENT, function(event, account) {
            $scope.alreadySubmitted = false;
            $scope.account = account;            
            $scope.$apply();
        });
        
        $scope.save = function() {     
            $scope.alreadySubmitted = true;
            Dao.save($scope.account, function(){
                $scope.showSuccessMessage = true;
                $timeout(function() {
                    $scope.showSuccessMessage = false;
                }, 1000);
            }, function(errorMessage) {
                $window.alert(errorMessage);
            });
        };
        
        $scope.alreadySubmitted = false;
                        
        $scope.account = null;
        
        $scope.showSuccessMessage = false;    
    };
    
    return result;
});