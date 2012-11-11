define('domain', [], function(){
    var domain = {};
        
    
    /* Account Type */
    domain.CategoryType = {};
    Object.defineProperty( domain.CategoryType, "ASSET", {  value: "ASSET",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "LIABILITY", {  value: "LIABILITY",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "INCOME", {  value: "INCOME",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "EXPENSE", {  value: "EXPENSE",  writable: false, enumerable: true, configurable: false});    
    
    /* Account */
    var Account = function(type, name, bankAccountNumber, description) {
        this.type = type;
        this.bankAccountNumber = bankAccountNumber;        
        this.description = description;
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
    
    Account.createFromDBO = function(dbo){
         var newAccount = new domain.Account(dbo.type, dbo.name, dbo.bankAccountNumber, dbo.description);
         Object.defineProperty( newAccount, "id", {  value: dbo.id,  writable: false, enumerable: true, configurable: false});
         return newAccount;
    };
    
    Object.defineProperty( domain, "Account", {  value: Account,  writable: false, enumerable: true, configurable: false});
    
    /* TransactionField */
    var TransactionField = {};    
    var transactionFieldValues = [];
    
    var createTransactionFieldEnumValue = function(enumValue, i18nKey, fieldName,required){
        var newEnumValue = {};
        Object.defineProperty( newEnumValue, "i18nKey", {  value: i18nKey,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( newEnumValue, "fieldName", {  value: fieldName,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( newEnumValue, "required", {  value: required,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( TransactionField, enumValue, {  value: newEnumValue,  writable: false, enumerable: true, configurable: false});
        transactionFieldValues.push(newEnumValue);
    };
    
    createTransactionFieldEnumValue('DATE', 'transactionDateField', 'date', true);
    createTransactionFieldEnumValue('AMOUNT', 'transactionAmountField', 'amount', true);
    createTransactionFieldEnumValue('DESCRIPTION', 'transactionDescriptionField', 'description', true);
    createTransactionFieldEnumValue('ADDRESS', 'transactionAddressField', 'address', false);
    Object.defineProperty( TransactionField, "values", {  value: transactionFieldValues,  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain, "TransactionField", {  value: TransactionField,  writable: false, enumerable: true, configurable: false});    
        
    /* Transaction */
    var Transaction = function(date, amount, description) {
        this.date = date;
        this.amount = amount;
        this.description = description;
        Object.defineProperty( this, "className", {  value: "Transaction",  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( this, "tagged", {    get: function() { 
                                                           return (this.debetAccount !== undefined && this.creditAccount != undefined &&
                                                                this.debetAccount !== null && this.creditAccount != null);
                                                        },
                                                    set: function(newValue) {
                                                        },
                                                    enumerable: true, configurable: false});
    };
    Object.defineProperty( domain, "Transaction", {  value: Transaction,  writable: false, enumerable: true, configurable: false});    
    
    /* General utils */
    var createTranslatableEnumValue = function(enumValue, i18nKey, values){
        var newEnumValue = {};
        Object.defineProperty( newEnumValue, "i18nKey", {  value: i18nKey,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( newEnumValue, "value", {  value: enumValue,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( TransactionField, enumValue, {  value: newEnumValue,  writable: false, enumerable: true, configurable: false});
        values.push(newEnumValue);
        return newEnumValue;
    };
    
    /* Rules */
    var RuleOperator = {};    
    var ruleOperatorValues = [];

    createTranslatableEnumValue('EQUALS', 'operatorEquals', ruleOperatorValues);        
    createTranslatableEnumValue('LIKE', 'operatorLike', ruleOperatorValues);
    Object.defineProperty( RuleOperator, "values", {  value: ruleOperatorValues,  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain, "RuleOperator", {  value: RuleOperator,  writable: false, enumerable: true, configurable: false});    
    
    var Rule = function() {    
      this.field = null;
      this.operator = null;
      this.value = null;
      this.category = null;
    };
    
    Object.defineProperty( domain, "Rule", {  value: Rule,  writable: false, enumerable: true, configurable: false});    
    return domain;
});