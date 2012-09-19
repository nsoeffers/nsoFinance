define('dao', [], function() {
    
    var dao = {};
    
    var db;
    
    dao.init = function() {
        // Deal with vendor prefixes
        if ( "webkitIndexedDB" in window ) {
          window.indexedDB      = window.webkitIndexedDB;
          window.IDBTransaction = window.webkitIDBTransaction;
          window.IDBKeyRange    = window.webkitIDBKeyRange;
          // ...
        } else if ( "moz_indexedDB" in window ) {
          window.indexedDB = window.moz_indexedDB;
        }
        if ( !window.indexedDB ) {
            alert('IndexedDB Database is not supported in your browser');
        } 
        
        var dbRequest = window.indexedDB.open(
          'nsoFinance',        // Database ID
          'Finance information stored by nsoFinance app' // Database Description
        );           
        
        dbRequest.onsuccess = function () {
            db = dbRequest.result;
            if ( db.version === '') {                
                var versionRequest = db.setVersion( '1.0' );
                versionRequest.onsuccess = function (  ) {
                    db.createObjectStore(
                      "Account",  // The Object Store’s name
                      {keyPath: 'name'}
                    ); 
                };
                versionRequest.onerror = function() {
                    alert('Error occurred while creating indexedDb');
                };
//            } else if ( db.version === '1.0'){
//                alert('Trying to delete');
//                var dbDeleteRequest = window.indexedDB.deleteDatabase('Groceries');
//                dbDeleteRequest.onerror = function() { alert('Error deleting database'); };
//                dbDeleteRequest.onsuccess = function() { alert('Successfully deleting database'); };
            }
        };
        
        dbRequest.onerror = function() {
            alert('Error occurred while opening indexedDb');
        };
        
        return dao;
        
    }
    
    dao.save = function (entity, successCallback, failureCallback){
        var transaction = db.transaction([ 'Account' ], window.IDBTransaction.READ_WRITE);
        var store = transaction.objectStore("Account");        
        var saveRequest = store.add(entity);
            
        saveRequest.onerror = function(){
            transaction.abort();
            failureCallback('Entry with description "' + entity.description + '" already exists');
        };
        saveRequest.onsuccess = function() {
            successCallback(entity);
        };
    };
    
    return dao;
});