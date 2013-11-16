'use strict';

describe('Service: rulesRepository', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var rulesRepository;
  beforeEach(inject(function (_rulesRepository_) {
    rulesRepository = _rulesRepository_;
  }));

  it('should do something', function () {
    expect(!!rulesRepository).toBe(true);
  });

});
