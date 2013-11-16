'use strict';

describe('Service: categoryRepository', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var categoryRepository;
  beforeEach(inject(function (_categoryRepository_) {
    categoryRepository = _categoryRepository_;
  }));

  it('should do something', function () {
    expect(!!categoryRepository).toBe(true);
  });

});
