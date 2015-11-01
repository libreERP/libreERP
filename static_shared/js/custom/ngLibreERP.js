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
  $scope.themeObj = {main : '#005173' , highlight :'#04414f'};
  $scope.theme = ":root { --themeMain: " + $scope.themeObj.main +";--headerNavbarHighlight:"+ $scope.themeObj.highlight +"; }";
  $scope.$watchGroup(['themeObj.main' , 'themeObj.highlight'] , function(newValue , oldValue){
    $scope.theme = ":root { --themeMain: " + $scope.themeObj.main +";--headerNavbarHighlight:"+ $scope.themeObj.highlight +"; }";
  })


  $scope.openSettings = function(position, backdrop , theme) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/settings.html',
      placement: position,
      size: 'md',
      backdrop: backdrop,
      controller: function($scope, $modalInstance , userProfileService , $http) {
        $scope.theme = theme;
        emptyFile = new File([""], "");
        $scope.settings = {displayPicture : emptyFile}
        $scope.me = userProfileService.get('mySelf');
        $scope.statusMessage = '';
        $scope.saveSettings = function(){
          var fd = new FormData();
          for(key in $scope.settings){
            fd.append( key , $scope.settings[key]);
          }
          $http({method : 'PATCH' , url : $scope.me.profile.url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
          then(function(response){
            $scope.statusMessage = response.status + ' : ' + response.statusText;
            $scope.httpStatus = 'success';
            setTimeout(function () {
              $scope.statusMessage = '';
              $scope.httpStatus = '';
              $scope.$apply();
            }, 4000);
          },function(response){
            $scope.httpStatus = 'danger';
            $scope.statusMessage = response.status + ' : ' + response.statusText;
            setTimeout(function () {
              $scope.statusMessage = '';
              $scope.httpStatus = '';
              $scope.$apply();
            }, 4000);
          });
        }
      }
    }).result.then(postClose, postClose);
  }

});
