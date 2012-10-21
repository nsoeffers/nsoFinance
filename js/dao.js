define('dao', [], function() {
    
    var dao = {};
    
    var db;
    var isInitialized = false;
    
    var init = function() {
        isInitialized = true;
        // Deal with vendor prefixes
        if ( "webkitIndexedDB" in window ) {
          window.indexedDB      = window.webkitIndexedDB;
          window.IDBTransaction = window.webkitIDBTransaction;
          window.IDBKeyRange    = window.webkitIDBKeyRange;
          window.IDBCursor      = window.webkitIDBCursor;
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
            if ( db.version === '' || db.version === '0.0') {                
                var versionRequest = db.setVersion( '1.1' );
                versionRequest.onsuccess = function () {                    
                    var accountStore = db.createObjectStore("Account", {keyPath: 'id', autoIncrement: true});
                    accountStore.createIndex('caseInsensitiveName', 'caseInsensitiveName', {unique : true});
                    accountStore.createIndex('accountType', 'accountType', {unique : false});
                    
                    db.createObjectStore("Transaction", {keyPath: 'id', autoIncrement: true});                    
                };
                versionRequest.onerror = function() {
                    window.alert('Error occurred while creating indexedDb');
                };
            } else if ( db.version === '1.0') {
                var versionRequest = db.setVersion( '1.1' );
                versionRequest.onsuccess = function () {                    
                    db.createObjectStore("Transaction", {keyPath: 'id', autoIncrement: true});
                };
                versionRequest.onerror = function() {
                    window.alert('Error occurred while creating indexedDb');
                };               
            }
        };
        
        dbRequest.onerror = function() {
            alert('Error occurred while opening indexedDb');
        };
        
        return dao;
        
    };
    
    var createRepository = function(storeName) {
        var repository = {};
        
        if ( !isInitialized ) {
            init();
        }
        
        repository.save = function(entity, successCallback, failureCallback) {
            save(entity, successCallback, failureCallback, storeName);
        };
        
        repository.remove = function(key, successCallback, failureCallback){
            remove(key, successCallback, failureCallback, storeName);
        };
        
        repository.findAll = function(successCallback){
            findAll(successCallback, storeName);
        };
                
        return repository;
    };
    
    dao.createAccountRepository = function() {
        var repository = createRepository('Account');
        repository.findAccountsByType = function(accountType, callback, mappingMethod){
            if ( !db ) {
                setTimeout(function() { repository.findAccountsByType(accountType, callback, mappingMethod); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Account' ], "readonly");
            var store = transaction.objectStore('Account');
            var cursorRequest = store.index('accountType').openCursor(accountType);
            var results = [];
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(results);
                    return;
                }
                results.push(mappingMethod(e.target.result.value));
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };

        return repository;
    };

    dao.createTransactionRepository = function() {
        var repository = createRepository('Transaction');
        
        repository.reset = function() {
            var versionRequest = db.setVersion( '1.0' );
            versionRequest.onsuccess = function () {                    
                db.deleteObjectStore('Transaction');
                init();
            };
            versionRequest.onerror = function() {
                window.alert('Error occurred while removing transaction store');
            };               

        };
        
        repository.findTransactions = function(callback) {
            if ( !db ) {
                setTimeout(function() { repository.findTransactions(callback); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Transaction' ], "readonly");
            var store = transaction.objectStore('Transaction');
            var cursorRequest = store.openCursor();
            var results = [];
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(results);
                    return;
                }
                results.push(e.target.result.value);
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };
        
        return repository;
    };
    

    var save = function (entity, successCallback, failureCallback, storeName){
        var transaction = db.transaction([ storeName ], "readwrite");
        var store = transaction.objectStore(storeName);        
        if ( entity !== null && entity.id !== undefined && entity.id !== null ) {
            var getRequest = store.put(entity);
            getRequest.onsuccess = successCallback;
            getRequest.onerror = failureCallback;
        } else {
            var saveRequest = store.add(entity);
                
            saveRequest.onerror = function(){
                transaction.abort();
                failureCallback('Entry with description "' + entity.description + '" already exists');
            };
            saveRequest.onsuccess = function() {
                successCallback(entity);
            };
        }
    };
    
    var remove = function (key, successCallback, failureCallback, storeName){
        var transaction = db.transaction([ storeName ], "readwrite");
        var store = transaction.objectStore(storeName);        
        var deleteRequest = store.delete(key);
            
        deleteRequest.onerror = function(){
            transaction.abort();
            failureCallback('Entry with description "' + entity.description + '" already exists');
        };
        deleteRequest.onsuccess = function() {
            successCallback();
        };
    };
    
    var findAll = function(successCallback, storeName){
        if ( !db ) {
            setTimeout(function() { findAll(successCallback, storeName); }, 100);
            return;
        }
        var transaction = db.transaction([ storeName ], "readonly");
        var store = transaction.objectStore(storeName);        
        var findRequest = store.openCursor();
            
        findRequest.onerror = function(){
            transaction.abort();
        };
        var results = [];
        findRequest.onsuccess = function(e) {            
            if ( !e.target || !e.target.result || e.target.result === null) {
                successCallback(results);
                return;
            }
            results.push(e.target.result.value);
            e.target.result.continue();
        };
    };
    
    
    return dao;
});