'use strict';

angular.module('yoApp')
  .service('ruleRepository', function ruleRepository(dao, domain) {
    var repository = dao.createRepository('Rule', domain.Rule.createFromDBO);
    return repository;
  });
