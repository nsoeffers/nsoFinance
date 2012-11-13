QUnit.config.autostart = false;
requirejs.config({
    paths: {
        'domain': '../../js/domain',
        'moment': '../../js/moment.min'
    }
});

//Bootstrap tests
require(['domain', 'tests'], function(domain, tests){
    QUnit.start(); 
});