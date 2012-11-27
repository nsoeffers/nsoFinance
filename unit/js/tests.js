define('tests', ['domain'], function(domain) {         
    "use strict";
    
    test( "When Category is initialized then caseInsensitiveName is also set", function() {
        equal( "TESTNAME", new domain.Category('ASSETS', 'TestName').caseInsensitiveName);
    });
    
    test( "When Category name is changed then caseInsensitiveName is also updated", function() {
        var category = new domain.Category('ASSETS', 'AccountName');
        category.name = "changedAccountName";
        equal( "CHANGEDACCOUNTNAME", category.caseInsensitiveName);
    });
    
    test( "When Category is initialized then className is set", function() {
        equal( "Category", new domain.Category('ASSETS', 'AccountName').className);
    });

    test( "When Category className is set then exception is thrown", function() {
        var category = new domain.Category('ASSETS', 'AccountName');
        try {
            category.className = 'UnexistingClass';
        } catch ( ex ) {
            equal( "className", ex['arguments'][0]);
        }        
    });
    
    test( "When trying to overwrite Category class of domain package then exception is thrown", function() {
        try {
            domain.Category = function(){ window.alert('dummyAccount'); };
        } catch ( ex ) {
            equal( "Category", ex['arguments'][0]);
        }
    });

    test( "When trying to overwrite TransactionField enum of domain package then exception is thrown", function() {
        try {
            domain.TransactionField = {};
        } catch ( ex ) {
            equal( "TransactionField", ex['arguments'][0]);
        }
    });
    
    test( "When TransactionField enum value is modified then exception is thrown", function() {
        try {
            domain.TransactionField.DATE = {};
        } catch ( ex ) {
            equal( "DATE", ex['arguments'][0]);
        }
    });

    test( "When field of enumValue is modified then exception is thrown", function() {
        try {
            domain.TransactionField.DATE.required = false;
        } catch ( ex ) {
            equal( "required", ex['arguments'][0]);
        }
    });
    
    test( "When trying to access private functions of domain package then undefined", function() {
        strictEqual(undefined, domain.createTransactionFieldEnumValue);
    });
    
    test( "When Transaction is initialized then className is set", function() {
        equal( "Transaction", new domain.Transaction(new Date(), 10.0).className);
    });

    test( "When Transaction is initialized then transaction is marked as untagged", function() {
        equal( false, new domain.Transaction(new Date(), 10.0).tagged);
    });
    
    test( "When Transaction is initialized then transaction status is combination of tagged and date attribute", function() {
        equal( "UNTAGGED_20120105", new domain.Transaction(new Date(2012, 0, 5), 10.0).status);
    });

    test( "When only debetAccount is set then transaction is not marked as tagged", function() {
        var transaction = new domain.Transaction(new Date(), 10.0);
        transaction.debetAccount = { id: 1, name: 'debetAccount' };
        equal( false, transaction.tagged);
    });
    
    test( "When only creditAccount is set then transaction is not marked as tagged", function() {
        var transaction = new domain.Transaction(new Date(), 10.0);
        transaction.creditAccount = { id: 1, name: 'creditAccount' };
        equal( false, transaction.tagged);
    });


    test( "When debet and creditAccount are set then transaction is flagged as being tagged", function() {
        var transaction = new domain.Transaction(new Date(), 10.0);
        transaction.debetAccount = { id: 1, name: 'debetAccount' };
        transaction.creditAccount = { id: 1, name: 'creditAccount' };
        equal( true, transaction.tagged);
    });

    test( "When debet and creditAccount are set then transaction statis is combination of tagged and date", function() {
        var transaction = new domain.Transaction(new Date(2012, 10, 13), 10.0);
        transaction.debetAccount = { id: 1, name: 'debetAccount' };
        transaction.creditAccount = { id: 1, name: 'creditAccount' };
        equal( "TAGGED_20121113", transaction.status);
    });

    test( "When trying to overwrite Rule class of domain package then exception is thrown", function() {
        try {
            domain.Rule = function(){ window.alert('dummyRule'); };
        } catch ( ex ) {
            equal( "Rule", ex['arguments'][0]);
        }
    });
    
    test( "When Rule processes a null transaction then false is returned ", function() {
        var rule = new domain.Rule();
        rule.field = domain.TransactionField.DESCRIPTION;
        rule.operator = domain.RuleOperator.EQUALS;
        rule.value = 'test';
        equal(false, rule.process(null));
    });
    
    test( "When Rule processes a transaction which applies then return true and category is set on transaction", function() {
        var rule = new domain.Rule();
        rule.field = domain.TransactionField.DESCRIPTION;
        rule.operator = domain.RuleOperator.EQUALS;
        rule.value = 'test';
        rule.category = new domain.Category();
        rule.category.name = 'Fees';
        
        var transaction = new domain.Transaction();
        transaction.description = 'test';
        equal(true, rule.process(transaction));
        equal(rule.category, transaction.creditAccount);
    });    

    test( "When Rule processes a transaction which does not apply then return false and no category is set on transaction", function() {
        var rule = new domain.Rule();
        rule.field = domain.TransactionField.DESCRIPTION;
        rule.operator = domain.RuleOperator.EQUALS;
        rule.value = 'test';
        rule.category = new domain.Category();
        rule.category.name = 'Fees';
        
        var transaction = new domain.Transaction();
        transaction.description = 'blabla';
        equal(false, rule.process(transaction));
        strictEqual(undefined, transaction.creditAccount);
    });    
    
    test( "When EQUALS ruleOperator is passed two null values then return true", function() {
        equal(true, domain.RuleOperator.EQUALS.compare(null, null));
    });
    
    test( "When EQUALS ruleOperator is passed one null value and one non-null value then return false", function() {
        equal(false, domain.RuleOperator.EQUALS.compare(null, "value"));
        equal(false, domain.RuleOperator.EQUALS.compare("value", null));
    });
    
    test( "When EQUALS ruleOperator is passed two different values then return false", function() {
        equal(false, domain.RuleOperator.EQUALS.compare("blabla", "testeke"));
    });

    test( "When EQUALS ruleOperator is passed equal values then return true", function() {
        equal(true, domain.RuleOperator.EQUALS.compare("testeke", "testeke"));
    });
    
    test( "When EQUALS ruleOperator is passed case insensitive equal values then return true", function() {
        equal(true, domain.RuleOperator.EQUALS.compare("TestekE", "tesTeke"));
    });

    test( "When LIKE ruleOperator is passed null values", function() {
        equal(false, domain.RuleOperator.LIKE.compare(null, null));
    });

    test( "When LIKE ruleOperator is passed one null value and one non-null values", function() {
        equal(false, domain.RuleOperator.LIKE.compare(null, 'value'));
    });

    test( "When LIKE ruleOperator is passed one null value and one non-null values", function() {
        equal(false, domain.RuleOperator.LIKE.compare('value', null));
    });

    test( "When LIKE ruleOperator is passed one value which contains the other value at the end", function() {
        equal(true, domain.RuleOperator.LIKE.compare('valueTest', 'Test'));
    });
    
    test( "When LIKE ruleOperator is passed one value which contains the other value in the beginning", function() {
        equal(true, domain.RuleOperator.LIKE.compare('Testvalue', 'Test'));
    });

    test( "When LIKE ruleOperator is passed one value which contains the other value in the middle", function() {
        equal(true, domain.RuleOperator.LIKE.compare('valueTestvalue', 'Test'));
    });
    
    test( "When LIKE ruleOperator is passed two equal values", function() {
        equal(true, domain.RuleOperator.LIKE.compare('Test', 'Test'));
    });    

    test( "When LIKE ruleOperator is passed one value which contains the other value case insensitive ", function() {
        equal(true, domain.RuleOperator.LIKE.compare('valueTestvalue', 'TesT'));
    });
    
});