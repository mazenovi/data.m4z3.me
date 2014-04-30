'use strict';

angular.module('datam4z3meApp')
  .controller('LessonsCtrl', function ($scope, config) {
  	$scope.lessons = config.loadFromGoogleSpreadsheet();
  });


angular.module('datam4z3meApp').directive('lesson', function() {
    return {
        restrict: 'E',
        scope: {
            lesson: '='
        },
        templateUrl: "views/partials/lesson.html",        
    };
});