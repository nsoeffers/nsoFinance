/** @license
 * RequireJS plugin for loading Google Ajax API modules thru `google.load`
 * Author: Miller Medeiros
 * Version: 0.2.0 (2011/12/06)
 * Released under the MIT license
 */
define(['async', 'propertyParser'], function (async, propertyParser) {

    var MODULES_PATTERN = /^([^!]+)(?:!([^!]+))*/;
    var MODULE_INFO_PATTERN = /^([^,]+)(?:,([^,]+))?/;

    function parseName(name){
        var result = [];
        var modules = MODULES_PATTERN.exec(name);
        for(var i = 1; i < modules.length; i++){
            var info = MODULE_INFO_PATTERN.exec(modules[i]);
            result.push({ name: info[1], version: info[2] || 'v1' });
        }
        return result;
    }
    
    return {
        load : function(name, req, onLoad, config){
            if (config.isBuild) {
                onLoad(null); //avoid errors on the optimizer
            } else {
                var modules = parseName(name);
                var modulesLoaded = 0;
                var checkModuleLoading = function () {
                    modulesLoaded++;
                    if ( modulesLoaded === modules.length) {
                        onLoad(window.gapi);
                    }
                };
                var onload = function(gapi) {
                    window.gapi.client.setApiKey('AIzaSyAnBgYwfNm7gf5jXwlTTYFBt-NMziXKjEY');
                    for(var i = 0; i < modules.length; i++){
                        window.gapi.client.load(modules[i].name, modules[i].version, checkModuleLoading);
                    }
                };

                req(['async!'+ (document.location.protocol === 'https:'? 'https' : 'http') +'://apis.google.com/js/client.js!onload'], onload);
            }
        }
    };

});