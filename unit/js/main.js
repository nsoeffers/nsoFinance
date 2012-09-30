QUnit.config.autostart = false;
requirejs.config({
    paths: {
        'domain': '../../js/domain'
    }
});

//Bootstrap tests
require(['domain', 'tests'], function(domain, tests){
    QUnit.start(); 
});