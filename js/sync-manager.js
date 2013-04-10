define(['gapi!fusiontables,v1!drive,v2', 'dao'], function(gapi, dao) {
        
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
        
    function sync() {
        if ( !!window.localStorage && !!window.localStorage.fusionTableId ) {
            var tableId = window.localStorage.fusionTableId;
            var since = !!window.localStorage && !!window.localStorage.lastSync? window.localStorage.lastSync : '0';
            dao.transactionRepository.findModifiedTransactions(since, function(transactions) {
                var sqlQuery = "";
                for(var i = 0; i < 100; i++){
                    var t = transactions[i];
                    sqlQuery += 'INSERT INTO ' + tableId + '(date, amount, description) VALUES (\'' + moment(t.date).format('YYYY.MM.DD') + '\',' + t.amount + ', \'' + t.description.replace("'", "\\'") + '\');';
                }
                var sqlRequest = gapi.client.fusiontables.query.sql({sql: sqlQuery});
                sqlRequest.execute(function(sqlResponse) {
                    window.console.log(JSON.stringify(sqlResponse));
                });
            });
        } else {
            createFusionTable();
        }
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
    
    SyncManager.prototype.sync = function() {
        if ( isAuthenticated ){
            sync();
        } else {
            login(sync);
        }
    };
    
    return SyncManager;
});