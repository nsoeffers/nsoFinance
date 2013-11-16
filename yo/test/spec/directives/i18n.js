'use strict';

describe('Directive: i18n', function () {

  // load the directive's module
  beforeEach(module('yoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<i18n></i18n>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the i18n directive');
  }));
});
