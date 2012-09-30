define('tests', ['domain'], function(domain) {         

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

    test( "When Account className is set then nothing happens", function() {
        var account = new domain.Account('ASSETS', 'AccountName');
        account.className = 'UnexistingClass';
        equal( "Account", account.className);
    });


});