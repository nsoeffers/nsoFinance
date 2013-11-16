'use strict';

angular.module('yoApp')
  .service('transactionRepository', function transactionRepository(dao, domain) {
    var repository = dao.createRepository('Transaction', domain.Transaction.createFromDBO);

    repository.reset = function() {
        var versionRequest = db.setVersion( '1.0' );
        versionRequest.onsuccess = function () {
            db.deleteObjectStore('Transaction');
        };
        versionRequest.onerror = function() {
            window.alert('Error occurred while removing transaction store');
        };
    };

    repository.findUntaggedTransactions = function(from, to, callback) {
        if ( !dao.isInitialized() ) {
            setTimeout(function() { repository.findUntaggedTransactions(from, to, callback); }, 100);
            return;
        }
        var transaction = dao.getTransaction('Transaction', "readonly");
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
        if ( !dao.isInitialized() ) {
            setTimeout(function() { repository.findModifiedTransactions(since, callback); }, 100);
            return;
        }
        var transaction = dao.getTransaction('Transaction' , "readonly");
        var store = transaction.objectStore('Transaction');
        var cursorRequest = store.index('modifiedOn').openCursor(window.IDBKeyRange.lowerBound(since, true), "prev");
        var results = [];
        var updateCallback = function(updatedTransactions, callback) {
            if ( updatedTransactions === undefined || updatedTransactions === null || updatedTransactions.length === 0 ){
                callback();
                return;
            }
            var dbTransaction = dao.getTransaction( 'Transaction', "readwrite");
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
        if ( !dao.isInitialized() ) {
            setTimeout(function() { repository.getMonthlyStatistics(year, month, callback); }, 100);
            return;
        }
        var transaction = dao.getTransaction('Transaction' , "readonly");
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
        if ( !dao.isInitialized() ) {
            setTimeout(function() { repository.unassignAllTransactionsMappedBy(rule, successCallback); }, 100);
            return;
        }
        var transaction = dao.getTransaction('Transaction' , "readwrite");
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
        if ( !dao.isInitialized() ) {
            setTimeout(function() { repository.getStatistics(callback); }, 100);
            return;
        }
        var statistics = {
            total: 0,
            tagged: 0
        };
        var transaction = dao.getTransaction('Transaction' , "readonly");
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
  });
