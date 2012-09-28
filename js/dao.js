define('dao', [], function() {
    
    var dao = {};
    
    var db;
    
    dao.init = function() {
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
            if ( db.version === '') {                
                var versionRequest = db.setVersion( '1.0' );
                versionRequest.onsuccess = function (  ) {
                    db.createObjectStore("Account", {keyPath: 'name'}); 
                };
                versionRequest.onerror = function() {
                    alert('Error occurred while creating indexedDb');
                };
            } else if ( db.version === '1.0'){
                var versionRequest = db.setVersion( '1.1' );
                versionRequest.onsuccess = function (  ) {
                    db.deleteObjectStore("Account"); 
                };                
            } else if ( db.version === '1.1'){
                var versionRequest = db.setVersion( '1.2' );
                versionRequest.onsuccess = function () {
                    db.createObjectStore("Account", {keyPath: 'id', autoIncrement: true});
                };                
            } else if ( db.version === '1.2'){
                var versionRequest = db.setVersion( '1.3' );
                versionRequest.onsuccess = function () {
                    db.deleteObjectStore("Account"); 
                    var store = db.createObjectStore("Account", {keyPath: 'id', autoIncrement: true});
                    store.createIndex('caseInsensitiveName', 'caseInsensitiveName', {unique : true});
                };
                versionRequest.onerror = function() {
                    window.alert('Error occurred while creating indexedDb');
                }
            }
        };
        
        dbRequest.onerror = function() {
            alert('Error occurred while opening indexedDb');
        };
        
        return dao;
        
    }
    
    dao.save = function (entity, successCallback, failureCallback){
        var transaction = db.transaction([ 'Account' ], "readwrite");
        var store = transaction.objectStore("Account");        
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
    
    dao.remove = function (key, successCallback, failureCallback){
        var transaction = db.transaction([ 'Account' ], "readwrite");
        var store = transaction.objectStore("Account");        
        var deleteRequest = store.delete(key);
            
        deleteRequest.onerror = function(){
            transaction.abort();
            failureCallback('Entry with description "' + entity.description + '" already exists');
        };
        deleteRequest.onsuccess = function() {
            successCallback();
        };
    };
    
    dao.retrieveAll = function (callback, mappingMethod){
        if ( !db ) {
            setTimeout(function() { dao.retrieveAll(callback, mappingMethod); }, 100);
            return;
        }
        var transaction = db.transaction([ 'Account' ], "readonly");
        var store = transaction.objectStore('Account');
        var cursorRequest = store.index('caseInsensitiveName').openCursor();
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
    
    return dao;
});