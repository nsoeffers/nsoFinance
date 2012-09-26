define('controllers', ['angular', 'dao', 'domain'], function(angular, dao, domain) {
    
    var ACCOUNT_SELECTED_EVENT = 'accountSelected';
    var result = {};
        
    result.AccountListCtrl = function ($scope, $rootScope, $window, Dao) {    
        $scope.accounts = [];
        
        $scope.refresh = function() {
            Dao.retrieveAll(function(results){
                $scope.accounts = results;
                $scope.$apply();
            });
        };
        
        $scope.select = function(account) {
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, account);
        };
        
        $scope.add = function() {  
            $rootScope.$broadcast(ACCOUNT_SELECTED_EVENT, new domain.Account(domain.AccountType.ASSET, ''));
        };
        
        $scope.refresh();
    };
    
    result.AccountDetailCtrl = function ($scope, $window, $timeout, Dao) {              
        
        $scope.$on(ACCOUNT_SELECTED_EVENT, function(event, account) {
            $scope.account = account;
            $scope.$apply();
        });
        
        $scope.save = function() {
            Dao.save($scope.account, function(){
                $scope.showSuccessMessage = true;
                $timeout(function() {
                    $scope.showSuccessMessage = false;
                }, 1000);
            }, function(errorMessage) {
                $window.alert(errorMessage);
            });
        };
                        
        $scope.account = null;
        
        $scope.showSuccessMessage = false;    
    };
    
    return result;
});