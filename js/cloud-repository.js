define(['gapi!fusiontables,v1!drive,v2', 'dao', 'moment'], function(gapi, dao, moment) {
        
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
    
    function saveTransactionsAndCreateTableIfNecessary(transactions, callback) {
        var saveTransactionsWhenTableExists = function() {
            window.setTimeout(saveTransactionsInBatch, 100, transactions, 0, callback);
        };
        if ( getTableId() === null || getTableId() === undefined) {
            createFusionTable(saveTransactionsWhenTableExists);
        } else {
            saveTransactionsWhenTableExists();
        }
    }
    
    function saveTransactionsInBatch(transactions, batchIndex, callback){
        var totalTransactionCount = transactions.length;
        var sqlQuery = "";
        var endOfBatch = ((batchIndex+1)*BATCH_SIZE) > totalTransactionCount? (totalTransactionCount % BATCH_SIZE) : BATCH_SIZE;
        for(var i = 0; i < endOfBatch; i++){
            var transaction = transactions[i+(batchIndex*BATCH_SIZE)];
            sqlQuery += !transaction.serverId? createInsertQuery(transaction) : createUpdateQuery(transaction);
        }
        var sqlRequest = gapi.client.fusiontables.query.sql({sql: sqlQuery});
        sqlRequest.execute(function(sqlResponse) {
            window.console.log(!!sqlResponse.rows? 'Succesfully saved:' + sqlResponse.rows.length + ' rows' : sqlResponse);
            if ( sqlResponse.rows ) {
                for(var rowIndex = 0; rowIndex < sqlResponse.rows.length; rowIndex++) {
                    transactions[(batchIndex*BATCH_SIZE)+rowIndex].serverId = sqlResponse.rows[rowIndex][0];
                }
            }
            if ( (batchIndex+1) < totalTransactionCount/BATCH_SIZE){
                window.setTimeout(saveTransactionsInBatch, 550, transactions, batchIndex+1, callback);
            } else {
                callback(transactions);
            }
        });        
    }
    
    function createInsertQuery(t){
        return 'INSERT INTO ' + getTableId() + '(date, amount, description, creditAccountType, creditAccountName) VALUES (\''
            + moment(t.date).format('YYYY.MM.DD') + '\',' 
            + t.amount + ', \'' 
            + t.description.replace("'", "\\'") + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.type) + '\', \'' 
            + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.name)  + '\');';
    }

    function createUpdateQuery(t){
        var query = 'UPDATE ' + getTableId() + ' SET ' 
            + 'creditAccountType = \'' + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.type) + '\', ' 
            + 'creditAccountName = \'' + (t.creditAccount === null || t.creditAccount === undefined ? '' : t.creditAccount.name)  + '\'' 
            + ' WHERE ROWID = \'' + t.serverId + '\';';
        window.console.log('QUERY: ' + query);
        return query;
    }
    
    function createFusionTable(callback) {
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
            callback();
        });
    }
    
    CloudRepository.prototype.saveTransactions = function(transactions, callback){
        if ( isAuthenticated ){
            saveTransactionsAndCreateTableIfNecessary(transactions, callback);
        } else {
            login(function() {
                saveTransactionsAndCreateTableIfNecessary(transactions, callback);
            });
        }        
    };
    
    return new CloudRepository();
});