'use strict';

describe('Service: syncManager', function () {

  // load the service's module
  beforeEach(module('yoApp'));

  // instantiate service
  var syncManager;
  beforeEach(inject(function (_syncManager_) {
    syncManager = _syncManager_;
  }));

  it('should do something', function () {
    expect(!!syncManager).toBe(true);
  });

});
