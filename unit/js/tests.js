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

});