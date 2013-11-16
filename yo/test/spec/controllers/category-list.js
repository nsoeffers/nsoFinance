'use strict';

describe('Controller: CategoryListCtrl', function () {

  // load the controller's module
  beforeEach(module('yoApp'));

  var CategoryListCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CategoryListCtrl = $controller('CategoryListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
