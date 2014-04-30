'use strict';

angular.module('datam4z3meApp')
  .controller('AtmoScraperCtrl', function ($scope, config) {
    
  	var AtmoConf = config.loadFromModuleExports();
  	var starting_year = parseInt(AtmoConf.starting_year);
  	var ending_year = parseInt(new Date().getFullYear());
    
	// http://stackoverflow.com/questions/21468244/dygraphs-not-working-with-ng-repeat
	// https://docs.angularjs.org/guide/directive
	$scope.gs = [];
	$scope.graphs = []
    $scope.blockRedraw = false;

    var drawCallback = function(me, initial) {
		if ($scope.blockRedraw || initial) return;
		$scope.blockRedraw = true;
		
        var year = parseInt(me.maindiv_.getAttribute('id'));
        var range = me.xAxisRange();
		var yrange = me.yAxisRange();

		for (var j = 0; j < $scope.gs.length; j++) {
			if ($scope.gs[j] == me) continue;
            var gs_year = parseInt($scope.gs[j].maindiv_.getAttribute('id'));
            var starting_date = new Date(range[0]);
            var ending_date = new Date(range[1]);
		    starting_date.setFullYear(starting_date.getFullYear()+(gs_year - year));
            ending_date.setFullYear(ending_date.getFullYear()+(gs_year - year));
            var range_ = Array();
            range_[0] = starting_date.getTime();
            range_[1] = ending_date.getTime();
            $scope.gs[j].updateOptions( {
				dateWindow: range_,
				valueRange: yrange
			});
		}
		$scope.blockRedraw = false;
	}

    var i=0;
    for(var yy=ending_year;yy>=starting_year;yy--)
  	{

  		$scope.graphs[i] = {
            year:  yy, 
            data:  "../../csv/atmo-" + yy + ".csv", 
            opts: { 
            	//labels: [ "x", "A", "B", "C", "D", "E", "F", "G" ],
                valueRange: [0, 1000],
            	width: "100%",
                drawCallback: drawCallback,
            }
        };
  		i++;
  	}

});

angular.module('datam4z3meApp').directive('graph', function() {
    return {
        restrict: 'E',
        scope: {
        	gs: '=',
        	blockRedraw: '=',
            year: '=',
            data: '=',
            opts: '='
        },
        template: "<div style=\"width: 100%\"></div>",
        link: function(scope, elem, attrs) {
            var graph = new Dygraph(elem.children()[0], scope.data, scope.opts );
            elem.children()[0].setAttribute('id', scope.year);
            elem.prepend('<h2>' + scope.year + '</h2>');
            scope.gs.push(graph);
        }
    };
});
