define(['gapi!fusiontables,v1'], function(gapi) {
        
    var SyncManager = function(){
    };

    var isAuthenticated = false;
    
    var config = {
      'client_id': '193757426551-rfsk4nsceb8n1tjcnpe9tdh69p59fq26.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/fusiontables'
    };
    
    var login = function(callback) {
        gapi.auth.authorize(config, function() {
            isAuthenticated = true;
            callback();
        });
    };
    
    var sync = function() {
        var request = gapi.client.fusiontables.table.list();
        request.execute(function(response){
            alert(JSON.stringify(response));
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