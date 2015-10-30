var app = angular.module('app' , ['ui.router']);

app.config(function($stateProvider ,  $urlRouterProvider){

  $urlRouterProvider.otherwise('/home');

});

app.run([ '$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  }
]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main' , function($scope , $state){
  $scope.headerUrl = '/static/ngTemplates/header.html';
  $scope.parentFn = function(){
    console.log("called the function in the parent");
  }

});
