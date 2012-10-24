define('tests', ['domain'], function(domain) {         
    "use strict";

    test( "When Account is initialized then caseInsensitiveName is also set", function() {
        equal( "TESTNAME", new domain.Account('ASSETS', 'TestName').caseInsensitiveName);
    });
    
    test( "When Account name is changed then caseInsensitiveName is also updated", function() {
        var account = new domain.Account('ASSETS', 'AccountName');
        account.name = "changedAccountName";
        equal( "CHANGEDACCOUNTNAME", account.caseInsensitiveName);
    });
    
    test( "When Account is initialized then className is set", function() {
        equal( "Account", new domain.Account('ASSETS', 'AccountName').className);
    });

    test( "When Account className is set then exception is thrown", function() {
        var account = new domain.Account('ASSETS', 'AccountName');
        try {
            account.className = 'UnexistingClass';
        } catch ( ex ) {
            equal( "className", ex['arguments'][0]);
        }        
    });
    
    test( "When trying to overwrite Account class of domain package then exception is thrown", function() {
        try {
            domain.Account = function(){ window.alert('dummyAccount'); };
        } catch ( ex ) {
            equal( "Account", ex['arguments'][0]);
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

});