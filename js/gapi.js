/** @license
 * RequireJS plugin for loading Google Ajax API modules thru `google.load`
 * Author: Miller Medeiros
 * Version: 0.2.0 (2011/12/06)
 * Released under the MIT license
 */
define(['async', 'propertyParser'], function (async, propertyParser) {

    var rParts = /^([^,]+)(?:,([^,]+))?(?:,(.+))?/;

    function parseName(name){
        var match = rParts.exec(name),
            data = {
                moduleName : match[1],
                version : match[2] || 'v1'
            };
        data.settings = propertyParser.parseProperties(match[3]);
        return data;
    }

    return {
        load : function(name, req, onLoad, config){
            if (config.isBuild) {
                onLoad(null); //avoid errors on the optimizer
            } else {
                var data = parseName(name),
                    settings = data.settings;

                settings.callback = onLoad;
                var onload = function(gapi) {
                    window.gapi.client.load(data.moduleName, data.version, function() {
                        onLoad(window.gapi);
                    });
                };

                req(['async!'+ (document.location.protocol === 'https:'? 'https' : 'http') +'://apis.google.com/js/client.js!onload'], onload);
            }
        }
    };

});