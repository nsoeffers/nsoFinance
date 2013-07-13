define(['gapi!fusiontables,v1!drive,v2', 'dao', 'moment', 'domain'], function(gapi, dao, moment, domain) {
        
    var CloudRepository = function(){
    };

    var isAuthenticated = false;
    var BATCH_SIZE = 500;
    
    var oAuthConfig = {
      'client_id': '193757426551-2fnngfb545ni2es4qnhf8315klsq6ufq.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/userinfo.email ' +
            'https://www.googleapis.com/auth/fusiontables ' +
            'https://www.googleapis.com/auth/drive'
    };
    
    function getTableId() { 
        return !!window.localStorage && !!window.localStorage.fusionTableId? window.localStorage.fusionTableId: null; 
    }
    
    function login(callback) {
        gapi.auth.authorize(oAuthConfig, function() {
            isAuthenticated = true;
            callback();
        });
    }
    
    function _saveTransactions(transactions, callback) {
        var queries = [];
        var updateQueries = [];
        for(var i = 0; i < transactions.length; i++ ){
            if ( !transactions[i].serverId) {
                queries.push(createInsertQuery(transactions[i]));
            } else {
                updateQueries.push(createUpdateQuery(transactions[i]));
            }
        }  
        var executeUpdateQueriesCallback = function() {
            if ( updateQueries.length > 0 ){
                window.setTimeout(executeQueriesInBatch, 550, updateQueries, 0, 1, function() { 
                    callback(transactions); 
                });
            } else {
                callback(transactions);
            }
        };
        if ( queries.length > 0){
            window.setTimeout(executeQueriesInBatch, 100, queries, 0, BATCH_SIZE, executeUpdateQueriesCallback);
        } else if ( updateQueries.length > 0 ){
            executeUpdateQueriesCallback();
        }
    }
    
    function executeQueriesInBatch(queries, batchIndex, batchSize, callback){
        var batchCount = queries.length/batchSize;
        var sleepTime = batchCount > 30? 2100 : 550;
        var totalQueriesCount = queries.length;
        var sqlQuery = "";
        var endOfBatch = ((batchIndex+1)*batchSize) > totalQueriesCount? (totalQueriesCount % batchSize) : batchSize;
        for(var i = 0; i < endOfBatch; i++){
            sqlQuery += queries[i+(batchIndex*batchSize)].query;
        }
        var sqlRequest = gapi.client.fusiontables.query.sql({sql: sqlQuery});
        sqlRequest.execute(function(sqlResponse) {
            if ( !!sqlResponse.error ){
                window.console.error('Error syncing:' + sqlResponse.error.message);
                return;
            }
            window.console.log(!!sqlResponse.rows? 'Succesfully saved:' + sqlResponse.rows.length + ' rows' : sqlResponse);
            if ( sqlResponse.rows ) {
                for(var rowIndex = 0; rowIndex < sqlResponse.rows.length; rowIndex++) {
                    queries[(batchIndex*batchSize)+rowIndex].transaction.serverId = sqlResponse.rows[rowIndex][0];
                }
            }
            if ( (batchIndex+1) < totalQueriesCount/batchSize){
                window.setTimeout(executeQueriesInBatch, sleepTime, queries, batchIndex+1, batchSize, callback);
            } else {
                callback();
            }
        });        
    }
    
    function createInsertQuery(t){
        return { query: 'INSERT INTO ' + getTableId() + '(date, amount, description, creditAccountType, creditAccountName, lastSyncedOn) VALUES (\''
            + moment(t.date).format('YYYY.MM.DD') + '\',' 
            + t.amount + ', \'' 
            + t.description.replace("'", "\\'") + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.type) + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.name)  + '\', \''
            + moment().format('YYYY.MM.DD HH:mm:ss.SSS') + '\');',
            transaction: t};
    }

    function createUpdateQuery(t){
        return { query: 'UPDATE ' + getTableId() + ' SET ' 
            + 'creditAccountType = \'' + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.type) + '\', ' 
            + 'creditAccountName = \'' + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.name)  + '\'' 
            + ' WHERE ROWID = \'' + t.serverId + '\';',
            transaction: t };
    }
    
    function _findExistingFusionTableIds(callback) {
        var getRootFolderRequest = gapi.client.drive.about.get();
        getRootFolderRequest.execute(function(result) {
            var query = "title='nsoFinance' and trashed=false and mimeType='application/vnd.google-apps.fusiontable'";
            var fileSearchRequest = gapi.client.drive.children.list({folderId: result.rootFolderId, q: query});
            fileSearchRequest.execute(function(files){
                var tableIds = [];
                if ( !files || !files.items){
                    callback(tableIds);
                    return;
                } 
                for( var index = 0; index < files.items.length; index++ ){
                    tableIds.push(files.items[index].id);
                }
                callback(tableIds);
            });
        });           
    }
    
    function _findModifiedTransactions(since, callback){
        window.console.log('MODIFIED TRANSACTIONS SINCE: ' + since + ', ' + moment(since, 'YYYYMMDDHHmmssSSS').format('YYYY.MM.DD HH:mm:ss.SSS'));
        var sqlQuery = 'SELECT ROWID, date, amount, description FROM ' + getTableId() + ' WHERE lastSyncedOn > \'' + moment(since, 'YYYYMMDDHHmmssSSS').format('YYYY.MM.DD HH:mm:ss.SSS') + '\'';
        var sqlRequest = gapi.client.fusiontables.query.sql({sql: sqlQuery});
        sqlRequest.execute(function(sqlResponse) {
            if ( !(sqlResponse.rows) ){
                window.console.log(sqlResponse);
                callback([]);
                return;
            }
            var results = [];
            for( var index = 0; index < sqlResponse.rows.length; index++){
                var transaction = {
                    serverId: sqlResponse.rows[index][0],
                    date: Date.parseExact(sqlResponse.rows[index][1], 'yyyy.MM.dd'),
                    amount: parseFloat(sqlResponse.rows[index][2]),
                    description: sqlResponse.rows[index][3]
                };
                results.push(domain.Transaction.createFromDBO(transaction));
            }
            callback(results);
        });

    }
        
    CloudRepository.prototype.createFusionTable = function(callback) {
        var columnDefinitions = [];
        columnDefinitions.push({"name": 'date', "type": 'DATETIME'});
        columnDefinitions.push({"name": 'amount', "type": 'NUMBER'});
        columnDefinitions.push({"name": 'description', "type": 'STRING'});
        columnDefinitions.push({"name": 'creditAccountType', "type": 'STRING'});
        columnDefinitions.push({"name": 'creditAccountName', "type": 'STRING'});
        columnDefinitions.push({"name": 'lastSyncedOn', "type": 'DATETIME'});
        var createTableRequest = gapi.client.request({ 
            path: '/fusiontables/v1/tables',
            method: 'POST',
            body: {"columns": columnDefinitions, "isExportable": true, "name": "nsoFinance"}});
        createTableRequest.execute(function(newFusionTable){
            window.console.log('Created Fusion Table with id:' + newFusionTable.tableId);
            window.localStorage.fusionTableId = newFusionTable.tableId;
            callback();
        });
    };
    
    CloudRepository.prototype.findExistingFusionTableIds = function(callback) {
        if ( isAuthenticated ){
            _findExistingFusionTableIds(callback);
        } else {
            login(function() {
                _findExistingFusionTableIds(callback);
            });
        }                
    };
    
    CloudRepository.prototype.saveTransactions = function(transactions, callback){
        if ( isAuthenticated ){
            _saveTransactions(transactions, callback);
        } else {
            login(function() {
                _saveTransactions(transactions, callback);
            });
        }        
    };
    
    CloudRepository.prototype.findModifiedTransactions = function(since, callback) {
        if ( isAuthenticated ){
            _findModifiedTransactions(since, callback);
        } else {
            login(function() {
                _findModifiedTransactions(since, callback);
            });
        }                        
    };
    
    CloudRepository.prototype.isConfigured = function() {
        return !!getTableId();
    };
    
    CloudRepository.prototype.setTableId = function(tableId){
        if ( !!window.localStorage ) {
            window.localStorage.fusionTableId = tableId;
        }
    };
    
    return new CloudRepository();
});