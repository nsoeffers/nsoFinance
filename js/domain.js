define('domain', [], function(){
    var domain = {};
    
    domain.AccountType = {};
    Object.defineProperty( domain.AccountType, "ASSET", {  value: "ASSET",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "LIABILITY", {  value: "LIABILITY",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "INCOME", {  value: "INCOME",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.AccountType, "EXPENSE", {  value: "EXPENSE",  writable: false, enumerable: true, configurable: false});
    
    domain.Account = function(accountType, name, bankAccountNumber) {
        this.accountType = accountType;
        this.bankAccountNumber = bankAccountNumber;        
        var caseInsensitiveNameVar = (name !== undefined && name !== null )? name.toUpperCase() : null;
        Object.defineProperty( this, "className", {  value: "Account",  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( this, "caseInsensitiveName", {  get: function() { 
                                                                    return caseInsensitiveNameVar;
                                                                },
                                                                set: function(newValue) {                                                                        
                                                                },
                                                                enumerable: true, configurable: false});
        Object.defineProperty( this, "name", {  get: function() { 
                                                    return name; 
                                                }, 
                                                set: function(newValue) { 
                                                    name = newValue; 
                                                    caseInsensitiveNameVar = (newValue !== undefined && newValue !== null )? newValue.toUpperCase() : null;    
                                                }, 
                                                enumerable: true, configurable: false});
                                                
    };
    
    return domain;
});