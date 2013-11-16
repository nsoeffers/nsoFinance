'use strict';

angular.module('yoApp')
  .service('dao', function dao() {
    var DB_NAME = 'nsoFinance';
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

    var dao = {};
    dao.createRepository = function(storeName, mappingFunction) {
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

    dao.isInitialized = function() {
        return !!db;
    };

    dao.getTransaction = function(entity, mode){
        return db.transaction([ entity ], mode)
    };

    dao.resetAll = function() {
        var deleteRequest = window.indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = function() {
            init();
        };

        deleteRequest.onerror = function () {
            window.alert('Error while deleting database');
        };
    };


    return dao;
  });
