'use strict';

angular.module('yoApp')
  .controller('RulesCtrl', function($scope, $timeout, $cookies, $locale, ruleRepository, transactionRepository, $window, domain) {
    $scope.fields = domain.TransactionField.values.slice(0);
    $scope.operators = domain.RuleOperator.values.slice(0);
    $scope.rule = new domain.Rule();
    $scope.rules = [];

    $scope.init = function() {
       $timeout(refreshDragAndDropTargets, 0, false);

       ruleRepository.findAll(function(results) {
               $scope.rules = results;
               $scope.$apply();
           });
       $timeout(function(){
           $('.categoryLabels.labelsArea .label').draggable({scope: 'Category', revert: true, containment: 'window',
               drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });
           $('#newRule .ruleCategory').droppable({scope: 'Category', hoverClass: 'dropCategoryHover',
               drop: onLabelDropped});
       }, 0 );
    };

    $scope.mapEnumToLabel = function(enumValue) {
       if ( enumValue === undefined || enumValue === null ) {
           return undefined;
       }
       if ( enumValue.i18nKey !== undefined || enumValue.i18nKey !== null ) {
           return translate(enumValue.i18nKey, $cookies, $locale);
       }
       return enumValue;
    };

    $scope.saveRule = function() {
       var process = $scope.rule.process;
       var compare = $scope.rule.operator.compare;
       delete $scope.rule.process;
       delete $scope.rule.operator.compare;
       ruleRepository.save($scope.rule, function(savedRule) {
               savedRule.process = process;
               savedRule.operator.compare = compare;
               $scope.$emit(RULE_SAVED_EVENT, savedRule);
               $scope.ruleToProcess = savedRule;
               $scope.rules.push(savedRule);
               $scope.rule = new domain.Rule();
               $scope.$apply();
               $timeout(processUnmappedTransactions, 0, false);
           }, function() { });
    };

    var processUnmappedTransactions = function() {
       transactionRepository.findUntaggedTransactions(new Date(0), new Date(2999, 0, 1), function(data){
           var mappedTransactionCount = 0;
           for(var i = data.length - 1; i >= 0; i--){
               if ( $scope.ruleToProcess.process(data[i]) === true ) {
                   mappedTransactionCount++;
                   transactionRepository.save(data[i], function(entity) {
                       mappedTransactionCount--;
                       $window.console.log('Saved transaction' + JSON.stringify(entity));
                   });
               }
           }
           var checkNewlyMappedTransactions = function() {
               if ( mappedTransactionCount === 0 ) {
                   $scope.$emit(TRANSACTIONS_MAPPED);
               } else {
                   $timeout(checkNewlyMappedTransactions, 0, false);
               }
           };
           $timeout(checkNewlyMappedTransactions, 0, false);

       });
    };

    var refreshDragAndDropTargets = function() {
       $('.fieldLabels.labelsArea .label').draggable({scope: 'Field', revert: true, containment: 'window',
                               drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });
       $('.operatorLabels.labelsArea .label').draggable({scope: 'Operator', revert: true, containment: 'window',
                               drag: function() {}, opacity: 0.5, cursor: "not-allowed", zIndex: 10 });
       $('#newRule .ruleField').droppable({scope: 'Field', hoverClass: 'dropFieldHover',
                               drop: onLabelDropped});
       $('#newRule .ruleOperator').droppable({scope: 'Operator', hoverClass: 'dropOperatorHover',
                               drop: onLabelDropped});
    };

    var onLabelDropped = function(event, ui) {
       var draggedElement = $(event.srcElement);
       if ( draggedElement.parents('.fieldLabels').size() !== 0) {
           $scope.onFieldSelected(draggedElement.text().trim());
       } else if ( draggedElement.parents('.operatorLabels').size() !== 0) {
           $scope.onOperatorSelected(draggedElement.text().trim());
       } else if ( draggedElement.parents('.categoryLabels').size() !== 0) {
           $scope.onCategorySelected(draggedElement.text().trim());
       }
       draggedElement.draggable('option', 'revert', false);
       draggedElement.detach().appendTo(event.target);
    };

    $scope.onFieldSelected = function(field){
       $('.ruleField').append('<span class="label label-important">' + $scope.mapEnumToLabel(field) + '</span');
       $scope.rule.field = field;
       $('.ruleOperator INPUT').focus();
       $scope.$emit(FIELD_SELECTED_EVENT, $scope.rule.field, $scope.rule);
    };

    $scope.onOperatorSelected = function(operator){
       $('.ruleOperator').append('<span class="label label-inverse">' + $scope.mapEnumToLabel(operator) + '<span>');
       $scope.rule.operator = angular.copy(operator);
       $('.ruleValue').focus();
    };

    $scope.onCategorySelected = function(selectedCategory){
       $scope.rule.category = selectedCategory;
       $('.ruleCategory').append('<span class="label ' + $scope.calculateClassName(selectedCategory) + '">' + $scope.mapCategoryToLabel(selectedCategory) + '</span>');
    };

    $scope.removeRule = function(){
       ruleRepository.remove(selectedRule.id,
           function() {
               var selectedIndex =  $scope.rules.indexOf(selectedRule);
               $scope.rules.splice(selectedIndex, 1);
               $scope.$apply();
           },
           function() {/* TODO: Error handling*/});
    };

    $scope.removeRuleAndAssignments = function(){
       transactionRepository.unassignAllTransactionsMappedBy(selectedRule, $scope.removeRule);
    };

    var selectedRule = null;

    $scope.selectRule = function(rule) {
       selectedRule = rule;
    };


    var calculateClassNameForCategory = function(category) {
        if ( category === null || category === undefined ) {
            return "";
        }
        var className = "";
        if ( category.type === domain.CategoryType.ASSET ) {
            className = 'label-info';
        } else if ( category.type === domain.CategoryType.LIABILITY ) {
            className = 'label-warning';
        } else if ( category.type === domain.CategoryType.EXPENSE ) {
            className = 'label-important';
        } else if ( category.type === domain.CategoryType.INCOME ) {
            className = 'label-success';
        }
        return className;
    };

    $scope.calculateClassName = calculateClassNameForCategory;
});
