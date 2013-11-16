'use strict';

angular.module('yoApp')
  .service('categoryRepository', function categoryRepository(domain, dao) {
        var STORE_NAME = 'Category';
        var repository = dao.createRepository(STORE_NAME, domain.Category.createFromDBO);
        repository.findCategoriesByType = function(categoryType, callback, mappingMethod){
            if ( !dao.isInitialized() ) {
                setTimeout(function() { repository.findCategoriesByType(categoryType, callback, mappingMethod); }, 100);
                return;
            }
            var transaction = dao.getTransaction(STORE_NAME , "readonly");
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
            if ( !dao.isInitialized() ) {
                setTimeout(function() { repository.search(query, callback, mappingMethod); }, 100);
                return;
            }
            var transaction = dao.getTransaction(STORE_NAME , "readonly");
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
  });
