define('dao', ['domain', 'moment'], function(domain, moment) {
    
    var DB_NAME = 'nsoFinance';
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
        
        var dbRequest = window.indexedDB.open(DB_NAME, 2);           
        
        dbRequest.onupgradeneeded = function() {
            db = dbRequest.result;
            var categoryStore = db.createObjectStore("Category", {keyPath: 'id', autoIncrement: true});
            categoryStore.createIndex('caseInsensitiveName', 'caseInsensitiveName', {unique : true});
            categoryStore.createIndex('type', 'type', {unique : false});
            
            var transactionStore = db.createObjectStore("Transaction", {keyPath: 'id', autoIncrement: true});
            transactionStore.createIndex('status', 'status', {unique : false});
            transactionStore.createIndex('modifiedOn', 'modifiedOn', {unique : false});
            transactionStore.createIndex('assignedBy', 'assignedBy', {unique : false});
            transactionStore.createIndex('serverId', 'serverId', {unique : true});
            
            db.createObjectStore("Rule", {keyPath: 'id', autoIncrement: true});                    
        };
        
        dbRequest.onsuccess = function () {
            db = dbRequest.result;
        };
        
        dbRequest.onerror = function(e) {
            alert('Error occurred while opening indexedDb' + JSON.stringify(e));
        };
        
        return dao;
        
    };
    
    var createRepository = function(storeName, mappingFunction) {
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
            findAll(successCallback, storeName, mappingFunction);
        };
                
        return repository;
    };
    
    dao.createCategoryRepository = function() {
        var STORE_NAME = 'Category';
        var repository = createRepository(STORE_NAME, domain.Category.createFromDBO);
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
            var cursorRequest = store.index('caseInsensitiveName').openCursor(window.IDBKeyRange.bound(query.toUpperCase(), queryEnd, false, true));
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

    function createTransactionRepository() {
        var repository = createRepository('Transaction', domain.Transaction.createFromDBO);
        
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
            var deleteRequest = window.indexedDB.deleteDatabase(DB_NAME);
            deleteRequest.onsuccess = function() {
                init();
            };
            
            deleteRequest.onerror = function () {
                window.alert('Error while deleting database');
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
            var cursorRequest = store.index('status').openCursor(window.IDBKeyRange.bound(fromKey, toKey, true, true), "prev");
            var results = [];
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(results);
                    return;
                }
                results.push(domain.Transaction.createFromDBO(e.target.result.value));
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };

        repository.findModifiedTransactions = function(since, callback) {
            if ( !db ) {
                setTimeout(function() { repository.findModifiedTransactions(since, callback); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Transaction' ], "readonly");
            var store = transaction.objectStore('Transaction');
            var cursorRequest = store.index('modifiedOn').openCursor(window.IDBKeyRange.lowerBound(since, true), "prev");
            var results = [];
            var updateCallback = function(updatedTransactions, callback) {
                if ( updatedTransactions === undefined || updatedTransactions === null || updatedTransactions.length === 0 ){
                    callback();
                    return;
                }
                var dbTransaction = db.transaction([ 'Transaction' ], "readwrite");
                var transactionStore = dbTransaction.objectStore('Transaction');
                
                dbTransaction.oncomplete = function(e){
                    window.console.log('Updated entities');
                    callback();                    
                };
                dbTransaction.onerror = function() {
                    alert('Failed to update synced item');
                };
                
                for(var index = 0; index < updatedTransactions.length; index++){
                    transactionStore.put(updatedTransactions[index]);
                }
            };
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(results, updateCallback);
                    return;
                }
                results.push(domain.Transaction.createFromDBO(e.target.result.value));
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };

        repository.getMonthlyStatistics = function(year, month, callback) {
            if ( !db ) {
                setTimeout(function() { repository.getMonthlyStatistics(year, month, callback); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Transaction' ], "readonly");
            var store = transaction.objectStore('Transaction');
            var fromKey = "TAGGED_" + moment(new Date(year, month, 1)).format('YYYYMM');
            var toKey = "TAGGED_" + moment(new Date(year, month+1, 1)).format('YYYYMM');
            var cursorRequest = store.index('status').openCursor(IDBKeyRange.bound(fromKey, toKey, true, false));
            var result = {};
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(result, year, month);
                    return;
                }
                var entity = domain.Transaction.createFromDBO(e.target.result.value);
                if ( result[entity.creditAccount.name] === undefined ) {
                    result[entity.creditAccount.name] = 0;
                }
                result[entity.creditAccount.name] += entity.amount;
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };

        repository.unassignAllTransactionsMappedBy = function(rule, successCallback){
            if ( !db ) {
                setTimeout(function() { repository.unassignAllTransactionsMappedBy(rule, successCallback); }, 100);
                return;
            }
            var transaction = db.transaction([ 'Transaction' ], "readwrite");
            var store = transaction.objectStore('Transaction');
            var cursorRequest = store.index('assignedBy').openCursor(IDBKeyRange.only('RULE_' + rule.id));
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    successCallback();
                    return;
                }
                var entity = domain.Transaction.createFromDBO(e.target.result.value);
                entity.unassign();
                var updateRequest = e.target.result.update(entity);
                updateRequest.onsuccess = function(updateEvent){
                    window.console.log('Succesfully updated: ' + JSON.stringify(entity));
                };
                updateRequest.onerror = function() {
                    alert('Failed to update transaction:' + JSON.stringify(entity));
                };
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };            
        };
        
        repository.getStatistics = function(callback){
            if ( !db ) {
                setTimeout(function() { repository.getStatistics(callback); }, 100);
                return;
            }
            var statistics = {
                total: 0,
                tagged: 0
            };
            var transaction = db.transaction([ 'Transaction' ], "readonly");
            var store = transaction.objectStore('Transaction');
            var cursorRequest = store.openCursor();
            cursorRequest.onsuccess = function(e) {
                if ( !e.target || !e.target.result || e.target.result === null) {
                    callback(statistics);
                    return;
                }
                statistics.total++;
                if (e.target.result.value.tagged) {
                    statistics.tagged++;
                }
                e.target.result.continue();
            };
            cursorRequest.onerror = function(){
                alert('Failed to retrieve items from IndexedDB');
            };
        };
        
        return repository;
    }
    
    dao.createRuleRepository = function() {
        var repository = createRepository('Rule', domain.Rule.createFromDBO);
        return repository;
    };

    var save = function (entity, successCallback, failureCallback, storeName){
        var transaction = db.transaction([ storeName ], "readwrite");
        var store = transaction.objectStore(storeName);
        entity.modifiedOn = moment().format('YYYYMMDDHHmmssSSS');
        if ( entity !== null && entity.id !== undefined && entity.id !== null ) {
            var getRequest = store.put(entity);
            getRequest.onsuccess = function() {
                successCallback(entity);
            };
            getRequest.onerror = failureCallback;
        } else {
            var saveRequest = store.add(entity);
                
            saveRequest.onerror = function(){
                transaction.abort();
                failureCallback('Entry with description "' + entity.description + '" already exists');
            };
            saveRequest.onsuccess = function() {
                var getRequest = store.get(this.result);
                getRequest.onsuccess = function() {
                    successCallback(this.result);                    
                };
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
    
    var findAll = function(successCallback, storeName, mappingFunction){
        if ( !db ) {
            setTimeout(function() { findAll(successCallback, storeName, mappingFunction); }, 100);
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
            results.push(mappingFunction === undefined || mappingFunction === null ? 
                e.target.result.value : mappingFunction(e.target.result.value));
            e.target.result.continue();
        };
    };
    
    dao.transactionRepository = createTransactionRepository();
    
    return dao;
});