'use strict';

var app = angular
  .module('datam4z3meApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      }).
      when('/atmoscraper', {
        templateUrl: 'views/atmoscraper.html',
        controller: 'AtmoScraperCtrl',
        resolve:{
          'AtmoConfig':function(config){
            return config.promise('../../config/atmoscraper.js');
          }
        }
      }).
      when('/chronolgies', {
        templateUrl: 'views/timelines.html',
        controller: 'TimelinesCtrl',
        resolve:{
          'TimelinesConfig':function(config){
            return config.googleSpreadsheetPromise('1-fxCHXBs9DXJnYAdq-oHcRK80H1OD4oNW5FU9gDi7pE');
          }
        }
      }).      
      when('/presentations', {
        templateUrl: 'views/presentations.html',
        controller: 'PresentationsCtrl',
        resolve:{
          'PresentationsConfig':function(config){
            return config.googleSpreadsheetPromise('1WaoRvsbyjUxZ3xWmBkNdRvmrj8l_yifKVG6-tTFc00M');
          }
        }
      }).
       when('/cours', {
        templateUrl: 'views/lessons.html',
        controller: 'LessonsCtrl',
        resolve:{
          'CoursConfig':function(config){
            return config.googleSpreadsheetPromise('1WQly9gjD6UlQRwpwgoPjRnmoMeV_1LmrsCP86RRRXKY');
          }
        }
      }).
      otherwise({
        redirectTo: '/'
      });
  });

app.service('config', function($http) {     
      var content = null;
      var promise = function(path) {
        return $http.get(path).success(function(data) {        
          content = data;
        });
      };
      var googleSpreadsheetPromise = function(key) {
        return $http.get('http://cors.io/spreadsheets.google.com/feeds/list/' + key + '/od6/public/values?alt=json').success(function(data) {        
          content = data;
        });
      };
      return {
        googleSpreadsheetPromise: googleSpreadsheetPromise,
        promise: promise,
        loadFromModuleExports: function () {
          var re = /module.exports = ({[\s\S.]*);/i;
          var found = content.match(re);
          return angular.fromJson(found[1]);
        },
        loadFromGoogleSpreadsheet: function () {
          var obj = Array();
          for(var entry in content.feed.entry) {
            obj[entry] = {};
            for(var prop in content.feed.entry[entry]) {
              if(prop.match(/gsx\$/i)) {
                obj[entry][prop.replace(/gsx\$/i,'')] = content.feed.entry[entry][prop]['$t'];
              }
            }
          }
          return obj;
        }
      };
    
});