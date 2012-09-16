function AccountListCtrl($scope, $window) {    
    $scope.accounts = [];  
};

function AccountDetailCtrl($scope, $window, $timeout) {  
    $scope.save = function() {
        $scope.showSuccessMessage = true;
        $timeout(function() {
            $scope.showSuccessMessage = false;
        }, 1000);
    };
    
    $scope.account = { name: ''};
    
    $scope.showSuccessMessage = false;    
    
};