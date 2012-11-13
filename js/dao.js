define('dao', ['moment'], function(moment) {
    
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
        
        var dbRequest = window.indexedDB.open('nsoFinance');           
        
        dbRequest.onsuccess = function () {
            db = dbRequest.result;
            if ( db.version === '' || db.version === '0.0') {                                
                var versionRequest = db.setVersion( '1.1' );
                versionRequest.onsuccess = function () {                    
                    var categoryStore = db.createObjectStore("Category", {keyPath: 'id', autoIncrement: true});
                    categoryStore.createIndex('caseInsensitiveName', 'caseInsensitiveName', {unique : true});
                    categoryStore.createIndex('type', 'type', {unique : false});
                    
                    var transactionStore = db.createObjectStore("Transaction", {keyPath: 'id', autoIncrement: true});
                    transactionStore.createIndex('status', 'status', {unique : false});
                    db.createObjectStore("Rule", {keyPath: 'id', autoIncrement: true});                    
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
    
    dao.createCategoryRepository = function() {
        var STORE_NAME = 'Category';
        var repository = createRepository(STORE_NAME);
        repository.findCategoriesByType = function(categoryType, callback, mappingMethod){
            if ( !db ) {
                setTimeout(function() { repository.findCategoriesByType(categoryType, callback, mappingMethod); }, 100);
                return;
            }
            var transaction = db.transaction([ STORE_NAME ], "readonly");
            var store = transaction.objectStore(STORE_NAME);
            var cursorRequest = store.index('type').openCursor(categoryType);
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

        repository.search = function(query, callback, mappingMethod){
            if ( query === undefined || query === null || query === "") {
                callback([]);
            }
            if ( !db ) {
                setTimeout(function() { repository.search(query, callback, mappingMethod); }, 100);
                return;
            }
            var transaction = db.transaction([ STORE_NAME ], "readonly");
            var store = transaction.objectStore(STORE_NAME);            
            var lastChar = query.toUpperCase().slice(-1);
            var queryEnd = query.toUpperCase().slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0)+1);
            var cursorRequest = store.index('caseInsensitiveName').openCursor(IDBKeyRange.bound(query.toUpperCase(), queryEnd, false, true));
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
            };
            versionRequest.onerror = function() {
                window.alert('Error occurred while removing transaction store');
            };               
        };
        
        repository.resetAll = function() {
            var versionRequest = db.setVersion( '0.0' );
            versionRequest.onsuccess = function () {                    
                db.deleteObjectStore("Category");                    
                db.deleteObjectStore("Transaction");
                db.deleteObjectStore("Rule");                    
            };
            versionRequest.onerror = function() {
                window.alert('Error occurred while removing transaction store');
            };                           
        };
        
        repository.findUntaggedTransactions = function(from, to, callback) {
            if ( !db ) {
                setTimeout(function() { repository.findUntaggedTransactions(from, to, callback); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Transaction' ], "readonly");
            var store = transaction.objectStore('Transaction');
            var fromKey = "UNTAGGED_" + moment(from).format('YYYYMMDD');
            var toKey = "UNTAGGED_" + moment(to).format('YYYYMMDD');
            var cursorRequest = store.index('status').openCursor(IDBKeyRange.bound(fromKey, toKey, true, true), "prev");
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
    
    dao.createRuleRepository = function() {
        var repository = createRepository('Rule');
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