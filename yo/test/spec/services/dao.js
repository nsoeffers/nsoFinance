'use strict';

describe('Service: dao', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var dao;
  beforeEach(inject(function (_dao_) {
    dao = _dao_;
  }));

  it('should do something', function () {
    expect(!!dao).toBe(true);
  });

});
