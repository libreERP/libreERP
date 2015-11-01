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
app.controller('main' , function($scope , $state , userProfileService , $aside){
  $scope.me = userProfileService.get('mySelf');
  $scope.headerUrl = '/static/ngTemplates/header.html',
  $scope.openSettings = function(position, backdrop) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $aside.open({
      template: '<p>Some heading</p>',
      placement: position,
      size: 'lg',
      backdrop: backdrop,
      controller: function($scope, $modalInstance) {
        $scope.ok = function(e) {
          $modalInstance.close();
          e.stopPropagation();
        };
        $scope.cancel = function(e) {
          $modalInstance.dismiss();
          e.stopPropagation();
        };
      }
    }).result.then(postClose, postClose);
  }

});
