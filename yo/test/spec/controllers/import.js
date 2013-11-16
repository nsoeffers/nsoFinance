'use strict';

describe('Controller: ImportCtrl', function () {

  // load the controller's module
  beforeEach(module('yoApp'));

  var ImportCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ImportCtrl = $controller('ImportCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
