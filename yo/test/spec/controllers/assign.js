'use strict';

describe('Controller: AssignCtrl', function () {

  // load the controller's module
  beforeEach(module('yoApp'));

  var AssignCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssignCtrl = $controller('AssignCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
