define(['cloud-repository', 'dao', 'moment'], function(cloudRepository, dao, moment) {
        
    var SyncManager = function(){
    };

    SyncManager.prototype.sync = function(callback) {
        var now = new Date();
        var since = !!window.localStorage && !!window.localStorage.lastSync? window.localStorage.lastSync : '0';
        dao.transactionRepository.findModifiedTransactions(since, function(transactions, updateCallback) { 
            var wrapperCallback = function(updatedTransactions) {
                updateCallback(updatedTransactions, callback);
                window.localStorage.lastSync = moment(now).format('YYYYMMDDHHmmssSSS');
            };
            if ( !transactions || transactions.length === 0){
                wrapperCallback(0);
            } else {
                cloudRepository.saveTransactions(transactions, wrapperCallback);
            }
        });
    };
        
    return new SyncManager();
});