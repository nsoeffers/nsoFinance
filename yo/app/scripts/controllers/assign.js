'use strict';

angular.module('yoApp')
  .controller('AssignCtrl', function($scope, $window, $timeout, $location, transactionRepository, categoryRepository, $rootScope, domain) {
    var CATEGORY_SELECTED_EVENT = 'categorySelected';
    var CATEGORY_SAVED_EVENT = 'categorySaved';
    var RULE_SAVED_EVENT = 'ruleSaved';
    var TRANSACTIONS_MAPPED = "transactionsMapped";
    var FIELD_SELECTED_EVENT = 'fieldSelected';
    var TRANSITION_END = 'webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd';
    $scope.transactions = null;

    // Configure sub views/presenters that are used in this view
    $scope.forbidCategoryAddition = true;
    $scope.forbidCategoryRemoval = true;
    $scope.hideCategoryDetailTitle = true;
    $scope.showCategoryTypeInDetailForm = true;

    var previousSelectedTransaction;
    var selectedTransaction;
    var creditCategoryChooser;
    var debetCategoryChooser;
    var selectedRow;
    var spinner;
    var creditSideSelected = null;

    var hideRuleForm = function() {
        if ( $('#hiddenEditableFields #ruleForm').size() === 0 ) {
            $('#ruleForm').detach().appendTo($('#hiddenEditableFields'));
            $('#ruleForm INPUT').val('').html(null);
            $('#ruleForm .ruleField .label, #ruleForm .ruleOperator .label, #ruleForm .ruleCategory .label').detach();
        }
    };

    var onPopupClosed = function(event, category) {
        if ( category === null || category === undefined ) {
            return;
        }
        if ( creditSideSelected ){
            $scope.updateCredit(category);
        } else {
            $scope.updateDebet(category);
        }
        $('#categoryBrowser').modal('hide');
        $('#categoryCreator').modal('hide');
    };

    $scope.$on(CATEGORY_SELECTED_EVENT, onPopupClosed);
    $scope.$on(CATEGORY_SAVED_EVENT, function(event, category) {
        onPopupClosed(event, category);
    });
    $scope.$on(RULE_SAVED_EVENT, function(event, rule) {
        hideRuleForm();
    });
    $scope.$on(TRANSACTIONS_MAPPED, function(event){
         refreshStatistics();
         $('#creditCategoryChooser').parent().detach().appendTo($('#hiddenEditableFields'));
         $scope.refresh();
    });

    $scope.$on(FIELD_SELECTED_EVENT, function(event, selectedField, selectedRule) {
        if ( selectedTransaction !== undefined && selectedTransaction !== null
                || selectedField !== undefined && selectedField !== null ) {
            selectedRule.value = selectedTransaction[selectedField.fieldName];
        }
    });

    $scope.setCreditSideSelected = function() {
        creditSideSelected = true;
    };

    $scope.setDebetSideSelected = function() {
        creditSideSelected = false;
    };

    $scope.addCreditCategory = function() {
        $scope.setCreditSideSelected();
        var newCategory = new domain.Category(domain.CategoryType.EXPENSE, creditCategoryChooser.val());
        $scope.$broadcast(CATEGORY_SELECTED_EVENT, newCategory);
    };

    $scope.addDebetCategory = function() {
        $scope.setDebetSideSelected();
        var newCategory = new domain.Category(domain.CategoryType.EXPENSE, debetCategoryChooser.val());
        $scope.$broadcast(CATEGORY_SELECTED_EVENT, newCategory);
    };

    $scope.init = function() {
        /*debetCategoryChooser = $('#debetCategoryChooser');
        debetCategoryChooser.focus(function() { $timeout(function() { debetCategoryChooser.select(); }, 0, false); } );
        debetCategoryChooser.blur(function() {
            if ( debetCategoryChooser.val() === "" && selectedTransaction.debetAccount !== null ) {
                $scope.updateDebet(undefined);
            }
        });*/
        creditCategoryChooser = $('#creditCategoryChooser');
        creditCategoryChooser.focus(function() { $timeout(function() { creditCategoryChooser.select(); }, 0, false); } );
        creditCategoryChooser.blur(function() {
            if ( creditCategoryChooser.val() === "" && selectedTransaction.creditAccount !== null ) {
                $scope.updateCredit(undefined);
            }
        } );

        refreshStatistics();
        $scope.refresh();
    };

    $scope.isActiveGranularity = function(granularity){
        return $location.search()[granularity] == true
            || ($.isEmptyObject($location.search()) && granularity === 'month')? 'active' : '';
    };

    $scope.setIntervalGranularity = function(granularity) {
        $location.search(granularity);
        $scope.refresh();
    };

    $scope.refresh = function() {
        spinner = new Spinner({lines: 10, width: 3, length: 7, hwaccel: true}).spin($('#waitForTransactions')[0]);

        var fromDate = moment().startOf('month').subtract('months', 2);
        var toDate = moment().startOf('month').subtract('months', 2).endOf('month');
        if ( $location.search().year === true ) {
            fromDate = moment().startOf('year');
            toDate = moment().endOf('year');
        } else if ( $location.search().all === true ) {
            fromDate = new Date(0);
            toDate = new Date(9999, 0, 1);
        }
        transactionRepository.findUntaggedTransactions(fromDate, toDate, function(data) {
            $scope.$apply(function(){
                $scope.transactions = data;
                spinner.stop();
                $('#waitForTransactions').hide();
            })});
    };

    $scope.toggleRuleForm = function() {
        var ruleForm = $('#ruleForm');
        if ( ruleForm.parents('#hiddenEditableFields').size() === 1){
            ruleForm.detach().appendTo(selectedRow);
            $timeout(function() { selectedRow.addClass("expanded");}, 0, false);
        } else {
            selectedRow.removeClass("expanded");
            $timeout(function() { ruleForm.detach().appendTo($('#hiddenEditableFields'));}, 500, false);
        }
    };

    $scope.setSelectedTransaction = function(e) {
        var currentTarget = $(e.currentTarget);
        var rowIndex = parseInt(currentTarget.data('rowIndex'), 10);
        if ( rowIndex >= 0 && rowIndex < $scope.transactions.length) {
            previousSelectedTransaction = selectedTransaction;
            selectedTransaction = $scope.transactions[rowIndex];
        }
    };

    $scope.selectRow = function(e){
        var currentTarget = $(e.currentTarget);
        if ( currentTarget[0] === creditCategoryChooser.parents('.row-fluid')[0] ){
            return;
        }
        hideRuleForm();

        $scope.setSelectedTransaction(e);
        var creditColumn = currentTarget.children().last().prev();
        //var debetColumn = currentTarget.children().last().prev().prev();
        creditCategoryChooser.val(creditColumn.text());
        //debetCategoryChooser.val(debetColumn.text());
        creditCategoryChooser.parent().removeClass('noMatch');
        //debetCategoryChooser.parent().removeClass('noMatch');
        creditColumn.text("");
        //debetColumn.text("");
        creditCategoryChooser.parent().detach().appendTo(creditColumn).show();
        //debetCategoryChooser.parent().detach().appendTo(debetColumn).show();
        if ( selectedRow !== undefined && selectedRow !== null ) {
            selectedRow.removeClass('active');
            selectedRow.removeClass('expanded');
            if ( previousSelectedTransaction !== undefined && previousSelectedTransaction !== null ) {
                selectedRow.children().last().prev().html(previousSelectedTransaction.creditAccount !== undefined ?
                    '<span class="label ' + calculateClassNameForCategory(previousSelectedTransaction.creditAccount) + '">'
                    + previousSelectedTransaction.creditAccount.name + '</span>': '');
                /*selectedRow.children().last().prev().prev().html(previousSelectedTransaction.debetAccount !== undefined ?
                    '<span class="label ' + calculateClassNameForCategory(previousSelectedTransaction.debetAccount) + '">'
                    + previousSelectedTransaction.debetAccount.name + '</span>': '');*/
            }
        }
        currentTarget.addClass('active');
        selectedRow = currentTarget;
        $timeout(function() {
            /*if ( selectedTransaction.debetAccount === null || selectedTransaction.debetAccount === undefined ) {
                debetCategoryChooser.focus();
            } else*/ if ( selectedTransaction.creditAccount === null || selectedTransaction.creditAccount === undefined ) {
                creditCategoryChooser.focus();
            }
        }, 0);
    };

    $scope.updateDebet = function(item) {
        updateAccount(item, 'debetAccount', debetCategoryChooser);
    };

    $scope.updateCredit = function(category) {
        updateAccount(category, 'creditAccount', creditCategoryChooser);
    };

    $scope.calculateClassName = calculateClassNameForCategory;

    var refreshStatistics = function() {
        transactionRepository.getStatistics(function(statistics) {
           $scope.$apply(function() {
               $scope.statistics = statistics;
           });
        });
    };

    var updateAccount = function(item, categoryType, field){
        $timeout(function() {field.val($rootScope.mapCategoryToLabel(item))}, 0, false);
        if ( selectedTransaction !== undefined && selectedTransaction !== null ) {
            if ( selectedTransaction[categoryType] === undefined || selectedTransaction[categoryType] === null) {
                selectedTransaction[categoryType] = {};
            }
            selectedTransaction[categoryType] = item;
            var updatedRow = selectedRow;
            transactionRepository.save(selectedTransaction,
                function() {
                    $(updatedRow).on(TRANSITION_END, function() { $(updatedRow).delay(1500).removeClass('saved')} ).addClass('saved');
                },
                function() { $window.alert('Error');});
        }
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

});
