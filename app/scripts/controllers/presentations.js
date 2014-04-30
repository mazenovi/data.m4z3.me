'use strict';

angular.module('datam4z3meApp')
  .controller('PresentationsCtrl', function ($scope, config) {
    $scope.presentations = config.loadFromGoogleSpreadsheet();   
  });

angular.module('datam4z3meApp').directive('presentation', function() {
    return {
        restrict: 'E',
        scope: {
            presentation: '='
        },
        templateUrl: "views/partials/presentation.html",        
    };
});