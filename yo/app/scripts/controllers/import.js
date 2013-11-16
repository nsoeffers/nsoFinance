'use strict';

angular.module('yoApp')
  .controller('ImportCtrl', function($scope, $locale, $cookies, $timeout, domain, transactionRepository, ruleRepository, $window, $rootScope, translations) {

    $scope.delimiter = ';';
    $scope.escaper = '\\';
    $scope.dateFormat = 'DD/MM/YYYY';
    $scope.thousandsSeparator = '.';
    $scope.decimalSeparator = ',';
    $scope.selectedFile = null;
    $scope.csvData = null;
    $scope.unmappedFields = domain.TransactionField.values;
    $scope.csvColumnToField = [];
    $scope.importStarted = false;
    $scope.savedTransactionCount = 0;
    $scope.fileReadingProgress = 0;
    $scope.saveProgress = 0;
    $scope.firstRowIsHeader = true;

    var file = null;
    var rules = [];

    $scope.init = function() {
        ruleRepository.findAll(function(result){
            rules = result;
        });
    };

    $scope.chooseFile = function() {
        $('input[id=csvFile]')[0].addEventListener('change', $scope.onFileSelected, false);
        $('input[id=csvFile]').click();
    };

    $scope.onFieldDropped = function(event, ui){
        $(event.srcElement).draggable('option', 'revert', false);
        $(event.srcElement).hide();
        var selectedColumn = $('.tablePreview TH').index($(event.target));
        var selectedUnmappedIndex = $('.labelsArea SPAN.label').index($(event.originalEvent.originalEvent.srcElement));
        var selectedTransactionField = null;
        if ( selectedUnmappedIndex === -1 ){
            selectedTransactionField = $scope.csvColumnToField[$('.tablePreview TH').index($(event.originalEvent.originalEvent.srcElement).parent())];
            $scope.csvColumnToField[$('.tablePreview TH').index($(event.originalEvent.originalEvent.srcElement).parent())] = undefined;
        } else {
            selectedTransactionField  = $scope.unmappedFields[selectedUnmappedIndex];
            $scope.unmappedFields.splice($('.labelsArea SPAN.label').index($(event.originalEvent.originalEvent.srcElement)), 1);
        }
        $scope.csvColumnToField[selectedColumn] = selectedTransactionField;
        refreshMappingReadyStatus();
        $scope.$apply();
        refreshDragAndDropTargets();
    };

    $scope.onFieldDragged = function(event, ui){
    };


    $scope.onFileSelected = function(e) {
        if ( e.target.files !== undefined && e.target.files !== null && e.target.files.length === 1 ) {
            file = e.target.files[0];
        }
        if (file !== null ) {
            var fileReader = new FileReader();
            fileReader.onload = function(e){
                $scope.csvData = $.csv.toArrays(e.target.result, { separator: $scope.delimiter, escaper: $scope.escaper });
                if ( !$scope.firstRowIsHeader ) {
                    var headerRow = [];
                    for( var columnIndex in $scope.csvData[0] ) {
                        headerRow.push(translate('column', $cookies, $locale) + columnIndex);
                    }
                    $scope.csvData.unshift(headerRow);
                }
                autoMap();
                $scope.$apply();
                refreshDragAndDropTargets();
            };
            // Only process the first 3kb to construct a preview
            fileReader.readAsText(file.slice(0, 3*1024));
        }
        $scope.selectedFile = file === null ? null : file.name;
        $scope.$apply();
    };

    $scope.continueImport = function() {
        $scope.importStarted = true;
        if (file !== null ) {
            var fieldToColumnIndexMap = {};
            for( var columnIndex in $scope.csvColumnToField ) {
                fieldToColumnIndexMap[$scope.csvColumnToField[columnIndex].fieldName] = columnIndex;
            }
            var fileReader = new FileReader();
            fileReader.onload = function(e){
                var data = $.csv.toArrays(e.target.result, { separator: ';', escaper: '\\' });
                var successCallback = function() {
                    $scope.savedTransactionCount++;
                    var total = $scope.firstRowIsHeader ? data.length - 2 : data.length - 1;
                    $scope.saveProgress = ($scope.savedTransactionCount * 100 ) / total;
                    if ( $scope.saveProgress === 100 ){
                        $timeout(function() { $($window.document.body).animate({ scrollTop: $window.document.body.scrollHeight+20}); }, 200);
                    }
                    $window.console.log('transaction:' + $scope.savedTransactionCount + ', length: ' + total + ', percent: ' + $scope.saveProgress);
                    $scope.$apply();
                };
                var errorCallback = function() { window.alert('Error saving transaction: '); };
                for( var rowIndex in data ) {
                    if ( rowIndex === "0" && $scope.firstRowIsHeader ) {
                        continue;
                    }
                    var row = data[rowIndex];
                    var amount = row[fieldToColumnIndexMap[domain.TransactionField.AMOUNT.fieldName]];
                    amount = amount.replace($scope.thousandsSeparator, '');
                    amount = amount.replace($scope.decimalSeparator, '.');
                    var transaction = new domain.Transaction(moment(row[fieldToColumnIndexMap[domain.TransactionField.DATE.fieldName]], $scope.dateFormat).toDate().getTime(),
                                                      parseFloat(amount),
                                                      row[fieldToColumnIndexMap[domain.TransactionField.DESCRIPTION.fieldName]]);
                    for(var index in rules){
                        rules[index].process(transaction);
                    }
                    transactionRepository.save(transaction, successCallback, errorCallback);
                }
            };
            fileReader.onprogress = function(e) {
                $scope.fileReadingProgress = (e.loaded * 100) / e.total;
                $scope.$apply();
            };
//                fileReader.onload = function(e) {
//                    $scope.fileReadingProgress = 100;
//                    $scope.$apply();
//                };
            fileReader.readAsText(file);
            $timeout(function() { $($window.document.body).animate({ scrollTop: $window.document.body.scrollHeight+20}); }, 200);
        }
    };

    var refreshMappingReadyStatus = function() {
        $scope.mappingReady = true;
        for ( var index in $scope.unmappedFields ) {
            if ( $scope.unmappedFields[index].required ) {
                $scope.mappingReady = false;
            }
        }
    };

//    var firstCall = true;
    var refreshDragAndDropTargets = function() {
        $('.tablePreview TH .label').css('left', '0px');
        $('.tablePreview TH .label').css('top', '0px');
        $timeout(function(){
//            if ( !firstCall ){
//                $('.labelsArea .label').draggable('destroy');
//                $('.tablePreview TH').droppable('destroy');
//            } else {
//                firstCall = false;
//            }
            $('.labelsArea .label').draggable({scope: 'Field', revert: true, containment: 'window',
                                                drag: $scope.onFieldDragged, opacity: 0.5 });
            $('.tablePreview TH .label').draggable({scope: 'Field', revert: true, containment: 'window',
                                                drag: $scope.onFieldDragged, opacity: 0.5});
            $('.tablePreview TH')
                .filter(function() { return !($(this).children().is('.label')); })
                .droppable({scope: 'Field', hoverClass: 'dropFieldHover',
                            drop: $scope.onFieldDropped});
        }, 200);
    };

    var autoMap = function() {
        if ( $scope.csvData === null || $scope.csvData === undefined || $scope.csvData.length <= 0 ) {
            return;
        }
        var fieldTranslations = {};
        for(var fieldIndex in domain.TransactionField.values) {
            var field = domain.TransactionField.values[fieldIndex];
            fieldTranslations[translate(field.i18nKey, $cookies, $locale)] = field;
        }
        for(var index in $scope.csvData[0]){
            if ( fieldTranslations[$scope.csvData[0][index]] !== undefined ) {
                var indexInUnmappedFields = $scope.unmappedFields.indexOf(fieldTranslations[$scope.csvData[0][index]]);
                if ( indexInUnmappedFields != -1 ) {
                    $scope.csvColumnToField[index] = fieldTranslations[$scope.csvData[0][index]];
                    $scope.unmappedFields.splice(indexInUnmappedFields, 1);
                }
            }
        }
        refreshMappingReadyStatus();
    };

    var translate = function(key, $cookies, $locale) {
        var selectedLanguage = $cookies.languagePreference !== undefined ? $cookies.languagePreference : $locale.id.substring(0,2);
        return translations[selectedLanguage][key];
    };
});
