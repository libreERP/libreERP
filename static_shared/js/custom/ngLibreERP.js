var app = angular.module('app' , ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside' ]);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider){

  $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;
  
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
