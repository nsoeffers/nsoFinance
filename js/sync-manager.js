define(['gapi!fusiontables,v1!drive,v2', ], function(gapi) {
        
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
        
    var sync = function() {
        if ( !!window.localStorage && !!window.localStorage.fusionTableId ) {
            var tableRequest = gapi.client.fusiontables.table.get({tableId: window.localStorage.fusionTableId});
            tableRequest.execute(function(table){
                window.console.log('Retrieved existing table:' + JSON.stringify(table));
            });
        }
        var infoRequest = gapi.client.drive.about.get();
        infoRequest.execute(function(driveInfo){
            if ( !!driveInfo.rootFolderId ) {
                var columnDefinitions = [];
                columnDefinitions.push({"name": 'date', "type": 'DATETIME'});
                columnDefinitions.push({"name": 'amount', "type": 'NUMBER'});
                columnDefinitions.push({"name": 'description', "type": 'STRING'});
                var createTableRequest = gapi.client.request({ 
                    path: '/fusiontables/v1/tables',
                    method: 'POST',
                    body: {"columns": columnDefinitions, "isExportable": true, "name": "nsoFinance"}});
                createTableRequest.execute(function(newFusionTable){
                    window.console.log('Created Fusion Table with id:' + newFusionTable.tableId);
                    window.localStorage.fusionTableId = newFusionTable.tableId;
                });
            }
        });
    };
    
    SyncManager.prototype.sync = function() {
        if ( isAuthenticated ){
            sync();
        } else {
            login(sync);
        }
    };
    
    return SyncManager;
});