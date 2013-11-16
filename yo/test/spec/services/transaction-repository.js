'use strict';

describe('Service: transactionRepository', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var transactionRepository;
  beforeEach(inject(function (_transactionRepository_) {
    transactionRepository = _transactionRepository_;
  }));

  it('should do something', function () {
    expect(!!transactionRepository).toBe(true);
  });

});
