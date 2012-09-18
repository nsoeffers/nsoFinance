define('controllers', ['angular'], function(angular) {
    
    return { 
        AccountListCtrl : function ($scope, $window) {    
            $scope.accounts = [];  
        },
    
        AccountDetailCtrl : function ($scope, $window, $timeout) {  
            $scope.save = function() {
                $scope.showSuccessMessage = true;
                $timeout(function() {
                    $scope.showSuccessMessage = false;
                }, 1000);
            };
        
            $scope.account = { name: ''};
            
            $scope.showSuccessMessage = false;    
        }
    };
});