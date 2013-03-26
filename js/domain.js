define('domain', ['moment'], function(moment){
    var domain = {};
        
    
    /* Category Type */
    domain.CategoryType = {};
    Object.defineProperty( domain.CategoryType, "ASSET", {  value: "ASSET",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "LIABILITY", {  value: "LIABILITY",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "INCOME", {  value: "INCOME",  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain.CategoryType, "EXPENSE", {  value: "EXPENSE",  writable: false, enumerable: true, configurable: false});    
    
    /* Category */
    var Category = function(type, name, description) {
        this.type = type;
        this.description = description;
        var caseInsensitiveNameVar = (name !== undefined && name !== null )? name.toUpperCase() : null;
        Object.defineProperty( this, "className", {  value: "Category",  writable: false, enumerable: true, configurable: false});
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
    
    Category.createFromDBO = function(dbo){
         var newCategory = new domain.Category(dbo.type, dbo.name, dbo.description);
         Object.defineProperty( newCategory, "id", {  value: dbo.id,  writable: false, enumerable: true, configurable: false});
         return newCategory;
    };
    
    Object.defineProperty( domain, "Category", {  value: Category,  writable: false, enumerable: true, configurable: false});
    
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
                                                           return (/*this.debetAccount !== undefined &&*/ this.creditAccount != undefined &&
                                                                /*this.debetAccount !== null &&*/ this.creditAccount != null);
                                                        },
                                                    set: function(newValue) {
                                                        },
                                                    enumerable: true, configurable: false});
        var that = this;
        Object.defineProperty( this, "status",  {  get: function() { 
                                                        return (that.tagged ? "TAGGED_" : "UNTAGGED_") + 
                                                            (date === undefined || date === null ? "" : moment(date).format('YYYYMMDD'));
                                                    },
                                                    set: function(newValue) {                                                                        
                                                    },
                                                    enumerable: true, configurable: false});
    };
    
    Transaction.prototype.unassign = function() {
        this.creditAccount = null;
        this.debetAccount = null;
    };
    
    Transaction.createFromDBO = function(dbo){
        var transaction = new Transaction(dbo.date, dbo.amount, dbo.description);
        Object.defineProperty( transaction, "id", {  value: dbo.id,  writable: false, enumerable: true, configurable: false});
        transaction.creditAccount = dbo.creditAccount;
        transaction.debetAccount = dbo.debetAccount;
        return transaction;
    };
    Object.defineProperty( domain, "Transaction", {  value: Transaction,  writable: false, enumerable: true, configurable: false});    
    
    /* General utils */
    var createTranslatableEnumValue = function(enumValue, i18nKey, enumClass, values){
        var newEnumValue = {};
        Object.defineProperty( newEnumValue, "i18nKey", {  value: i18nKey,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( newEnumValue, "value", {  value: enumValue,  writable: false, enumerable: true, configurable: false});
        Object.defineProperty( enumClass , enumValue, {  value: newEnumValue,  writable: false, enumerable: true, configurable: false});
        values.push(newEnumValue);
        return newEnumValue;
    };
    
    /* Rules */
    var RuleOperator = {};    
    var ruleOperatorValues = [];
    
    var createRuleOperatorEnumValue = function(enumValue, i18nKey, values, compareToFunction) {
        var self = createTranslatableEnumValue(enumValue, i18nKey, RuleOperator, values);
        self.compare = compareToFunction;
        return self;
    };

    createRuleOperatorEnumValue('EQUALS', 'operatorEquals', ruleOperatorValues, function(fieldValue, ruleValue) { 
        var safeFieldValue = fieldValue === null || fieldValue === undefined ? fieldValue : fieldValue.toLowerCase();
        var safeRuleValue = ruleValue === null || ruleValue === undefined ? ruleValue : ruleValue.toLowerCase();
        return safeFieldValue === safeRuleValue;
    });        
    createRuleOperatorEnumValue('LIKE', 'operatorLike', ruleOperatorValues, function(fieldValue, ruleValue) { 
        if ( fieldValue === null || fieldValue === undefined ) {
            return false;
        } 
        var safeFieldValue = fieldValue === null || fieldValue === undefined ? fieldValue : fieldValue.toLowerCase();
        var safeRuleValue = ruleValue === null || ruleValue === undefined ? ruleValue : ruleValue.toLowerCase();
        return safeFieldValue.indexOf(safeRuleValue) != -1; 
    });
    Object.defineProperty( RuleOperator, "values", {  value: ruleOperatorValues,  writable: false, enumerable: true, configurable: false});
    Object.defineProperty( domain, "RuleOperator", {  value: RuleOperator,  writable: false, enumerable: true, configurable: false});    
    
    var Rule = function() {    
      this.field = null;
      this.operator = null;
      this.value = null;
      this.category = null;
    };
    
    Rule.prototype.process = function(transaction) {
        if ( transaction === null || transaction === undefined || this.field === null 
                || this.operator === null || this.value === null){
            return false;
        }
        var fieldValue = transaction[this.field.fieldName];
        var ruleAppliesOnTransaction = this.operator.compare(fieldValue, this.value);
        if ( ruleAppliesOnTransaction === true ){
            transaction.creditAccount = this.category;
            transaction.assignedBy = 'RULE_' + this.id;
        }
        return ruleAppliesOnTransaction;
    };
    
    Rule.createFromDBO = function(dbo) {
        var rule = new Rule();
        Object.defineProperty( rule, "id", {  value: dbo.id,  writable: false, enumerable: true, configurable: false});
        rule.field = dbo.field;
        rule.operator = RuleOperator[dbo.operator.value];
        rule.value = dbo.value;
        rule.category = dbo.category;
        return rule;
    };
    
    Object.defineProperty( domain, "Rule", {  value: Rule,  writable: false, enumerable: true, configurable: false});    
    return domain;
});