define(['gapi!fusiontables,v1!drive,v2', 'dao', 'moment'], function(gapi, dao, moment) {
        
    var SyncManager = function(){
    };

    var isAuthenticated = false;
    
    var config = {
      'client_id': '193757426551-2fnngfb545ni2es4qnhf8315klsq6ufq.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/fusiontables ' +
            'https://www.googleapis.com/auth/drive'
    };
    
    var login = function(callback) {
        gapi.auth.authorize(config, function() {
            isAuthenticated = true;
            callback();
        });
    };
    
    var BATCH_SIZE = 500;
    var tableId = !!window.localStorage && !!window.localStorage.fusionTableId? window.localStorage.fusionTableId: null;
        
    function sync(callback) {
        if ( tableId === null || tableId === undefined) {
            createFusionTable();
        }
        var now = new Date();
        var since = !!window.localStorage && !!window.localStorage.lastSync? window.localStorage.lastSync : '0';
        dao.transactionRepository.findModifiedTransactions(since, function(transactions) { 
            var wrapperCallback = function() {
                window.localStorage.lastSync = moment(now).format('YYYYMMDDHHmmssSSS');
                callback();
            };
            if ( !transactions || transactions.length === 0){
                wrapperCallback(0);
            } else {
                saveTransactionsInCloud(transactions, wrapperCallback);
            }
        });
    }
    
    function saveTransactionsInCloud(transactions, callback) {
        window.setTimeout(saveTransactionBatchInCloud, 100, transactions, 0, callback);
    }
    
    function saveTransactionBatchInCloud(transactions, batchIndex, callback){
        var totalTransactionCount = transactions.length;
        var sqlQuery = "";
        var endOfBatch = ((batchIndex+1)*BATCH_SIZE) > totalTransactionCount? (totalTransactionCount % BATCH_SIZE) : BATCH_SIZE;
        for(var i = 0; i < endOfBatch; i++){
            sqlQuery += createInsertQuery(transactions[i+(batchIndex*BATCH_SIZE)]);
        }
        var sqlRequest = gapi.client.fusiontables.query.sql({sql: sqlQuery});
        sqlRequest.execute(function(sqlResponse) {
            window.console.log(!!sqlResponse.rows? 'Succesfully saved:' + sqlResponse.rows.length + ' rows' : sqlResponse);
            if ( (batchIndex+1) < totalTransactionCount/BATCH_SIZE){
                window.setTimeout(saveTransactionBatchInCloud, 550, transactions, batchIndex+1, callback);
            } else {
                callback(transactions.length);
            }
        });        
    }
    
    function createInsertQuery(t){
        return 'INSERT INTO ' + tableId + '(date, amount, description, creditAccountType, creditAccountName) VALUES (\''
            + moment(t.date).format('YYYY.MM.DD') + '\',' 
            + t.amount + ', \'' 
            + t.description.replace("'", "\\'") + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.type) + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.name)  + '\');';
    }
    
    function createFusionTable() {
        var columnDefinitions = [];
        columnDefinitions.push({"name": 'date', "type": 'DATETIME'});
        columnDefinitions.push({"name": 'amount', "type": 'NUMBER'});
        columnDefinitions.push({"name": 'description', "type": 'STRING'});
        columnDefinitions.push({"name": 'creditAccountType', "type": 'STRING'});
        columnDefinitions.push({"name": 'creditAccountName', "type": 'STRING'});
        var createTableRequest = gapi.client.request({ 
            path: '/fusiontables/v1/tables',
            method: 'POST',
            body: {"columns": columnDefinitions, "isExportable": true, "name": "nsoFinance"}});
        createTableRequest.execute(function(newFusionTable){
            window.console.log('Created Fusion Table with id:' + newFusionTable.tableId);
            window.localStorage.fusionTableId = newFusionTable.tableId;
        });
    }
    
    SyncManager.prototype.sync = function(callback) {
        if ( isAuthenticated ){
            sync(callback);
        } else {
            login(function() {
                sync(callback);
            });
        }
    };
    
    return SyncManager;
});