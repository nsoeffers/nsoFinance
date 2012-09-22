define('controllers', ['angular', 'dao', 'domain'], function(angular, dao, domain) {
    
    var result = {};
        
    result.AccountListCtrl = function ($scope, $window, Dao) {    
        $scope.accounts = [];
        
        $scope.refresh = function() {
            Dao.retrieveAll(function(results){
                $scope.accounts = results;
                $scope.$apply();
            });
        }
        
        $scope.refresh();
    };
    
    result.AccountDetailCtrl = function ($scope, $window, $timeout, Dao) {              
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
        
        $scope.account = new domain.Account(domain.AccountType.ASSET, '');
        
        $scope.showSuccessMessage = false;    
    };
    
    return result;
});