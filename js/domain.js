define('domain', [], function(){
    var domain = {};
    
    domain.AccountType = {};
    Object.defineProperty( domain.AccountType, "ASSET", {  value: "ASSET",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "LIABILITY", {  value: "LIABILITY",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "INCOME", {  value: "INCOME",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "EXPENSE", {  value: "EXPENSE",  writable: false, enumerable: true, configurable: false});
    
    domain.Account = function(accountType, name, bankAccountNumber) {
        this.accountType = accountType;
        this.name = name;
        this.bankAccountNumber = bankAccountNumber;        
        Object.defineProperty( this, "className", {  value: "Account",  writable: false, enumerable: true, configurable: false});
    }    
    
    return domain;
});