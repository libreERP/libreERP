var app = angular.module('app' , ['ui.bootstrap', 'ngSanitize' ]);

app.config(function( $httpProvider ){

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.controller('public.blogs.accounts' , function($scope, $http){

  console.log('loaded');

  $scope.testVar = 'Dsdasd'


});
