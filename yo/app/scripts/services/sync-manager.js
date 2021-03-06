'use strict';

angular.module('yoApp')
  .service('syncManager', function syncManager(dao) {
    var syncManager = { };

    syncManager.sync = function(callback) {
        var now = new Date();
        var since = !!window.localStorage && !!window.localStorage.lastSync? window.localStorage.lastSync : '0';
        dao.transactionRepository.findModifiedTransactions(since, function(transactions, updateCallback) {
            var findRemotelyModifiedTransactions = function() {
                cloudRepository.findModifiedTransactions(since, function(transactions) {
                    updateCallback(transactions, callback);
                });
            };
            var wrapperCallback = function(updatedTransactions) {
                updateCallback(updatedTransactions, findRemotelyModifiedTransactions);
                window.localStorage.lastSync = moment(now).format('YYYYMMDDHHmmssSSS');
            };
            if ( !transactions || transactions.length === 0){
                wrapperCallback([]);
            } else {
                cloudRepository.saveTransactions(transactions, wrapperCallback);
            }
        });
    };

    syncManager.reset = function() {
        window.localStorage.lastSync = undefined;
    };

    syncManager.isConfigured = function() {
        return !!dao /*&& !!cloudRepository && !!cloudRepository.isConfigured()*/;
    };

    return syncManager;
  });
