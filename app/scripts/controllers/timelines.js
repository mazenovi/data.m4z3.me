'use strict';

angular.module('datam4z3meApp')
  .controller('TimelinesCtrl', function ($scope, config) {
    $scope.timelines = config.loadFromGoogleSpreadsheet();   
  });

angular.module('datam4z3meApp').directive('timeline', function() {
    return {
        restrict: 'E',
        scope: {
            timeline: '='
        },
        templateUrl: "views/partials/timeline.html",        
    };
});