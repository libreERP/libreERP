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
app.controller('main' , function($scope , $state , userProfileService , $aside , $http){
  $scope.me = userProfileService.get('mySelf');
  $scope.headerUrl = '/static/ngTemplates/header.html',
  $scope.themeObj = {main : '#005173' , highlight :'#04414f'};

  $http({method : 'GET' , url : $scope.me.settings}).
  then(function(response){
    for(key in response.data.theme){
      if (key !='url') {
        console.log(key);
        $scope.themeObj[key] = response.data.theme[key];
      }
    }
  } , function(response){});

  $scope.theme = ":root { --themeMain: " + $scope.themeObj.main +";--headerNavbarHighlight:"+ $scope.themeObj.highlight +"; }";
  $scope.$watchGroup(['themeObj.main' , 'themeObj.highlight'] , function(newValue , oldValue){
    $scope.theme = ":root { --themeMain: " + $scope.themeObj.main +";--headerNavbarHighlight:"+ $scope.themeObj.highlight +"; }";
  })
  settings = {theme : $scope.themeObj , mobile : $scope.me.profile.mobile };
  $scope.openSettings = function(position, backdrop , data ) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
      $scope.me = userProfileService.get('mySelf' , true)
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/settings.html',
      placement: position,
      size: 'md',
      backdrop: backdrop,
      controller: function($scope, $modalInstance , userProfileService , $http) {
        emptyFile = new File([""], "");
        $scope.settings = settings;
        $scope.settings.displayPicture = emptyFile;
        $scope.me = userProfileService.get('mySelf');
        $scope.statusMessage = '';
        $scope.settings.password='';
        $scope.cancel = function(e) {
          $modalInstance.dismiss();
          // e.stopPropagation();
        };

        $scope.successMsg = function(response){
          $scope.statusMessage = response.status + ' : ' + response.statusText;
          $scope.httpStatus = 'success';
          setTimeout(function () {
            $scope.statusMessage = '';
            $scope.httpStatus = '';
            $scope.$apply();
          }, 4000);
        }
        $scope.errorMsg = function(response){
          $scope.httpStatus = 'danger';
          $scope.statusMessage = response.status + ' : ' + response.statusText;
          setTimeout(function () {
            $scope.statusMessage = '';
            $scope.httpStatus = '';
            $scope.$apply();
          }, 4000);
        }
        $scope.saveSettings = function(){
          console.log($scope.settings);
          var fdProfile = new FormData();
          if ($scope.settings.displayPicture != emptyFile) {
            fdProfile.append('displayPicture'  , $scope.settings.displayPicture);
          }
          if (isNumber($scope.settings.mobile)) {
            fdProfile.append('mobile' , $scope.settings.mobile);
          }
          $http({method : 'PATCH' , url : $scope.me.profile.url , data : fdProfile , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).then(function(){

            $http({method : 'PATCH' , url : $scope.me.settings, data : {presence : "Busy"  , user : $scope.me.url}}).
            then(function(response){
              $http({method : 'PATCH' , url : response.data.theme.url , data : $scope.settings.theme}).then($scope.successMsg,$scope.errorMsg);});
            if ($scope.settings.password !='' && $scope.settings.password2 == $scope.settings.password && $scope.settings.oldPassword!='') {
              $http({method : 'PATCH' , url : $scope.me.url , data : {password : $scope.settings.password , oldPassword : $scope.settings.oldPassword}}).then($scope.successMsg,$scope.errorMsg);
            }
          });

        }
      }
    }).result.then(postClose, postClose);
  }

  // $scope.fetchNotifications = function() {
  //   // console.log("going to fetch notifictions");
  //   $scope.method = 'GET';
  //   $scope.url = '/api/notification/';
  //   $scope.notifications = [];
  //   $scope.notificationCount =0;
  //   $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
  //     then(function(response) {
  //       $scope.notificationFetchStatus = response.status;
  //       // console.log(response);
  //       $scope.notificationCount = response.data.length;
  //       for (var i = 0; i < response.data.length; i++) {
  //         var notification = response.data[i]
  //         $scope.notifications.push(notification)
  //       }
  //     }, function(response) {
  //       $scope.notificationFetchStatus = response.status;
  //   });
  // };
  // $scope.usersProfile = [];
  // $scope.fetchMessages = function() {
  //   $scope.method = 'GET';
  //   $scope.url = '/api/chatMessage/';
  //   $scope.ims = [];
  //   $scope.imsCount = 0;
  //   var senders = [];
  //   $http({method: $scope.method, url: $scope.url, cache: $templateCache}).
  //     then(function(response) {
  //       $scope.messageFetchStatus = response.status;
  //       $scope.imsCount = response.data.length;
  //       // console.log(response.data);
  //       for (var i = 0; i < response.data.length; i++) {
  //         var im = response.data[i];
  //         // console.log(senders.indexOf(im.originator));
  //         if (im.originator != null){
  //           if (senders.indexOf(im.originator) ==-1){
  //             $scope.ims.push(im);
  //             senders.push(im.originator);
  //             $scope.ims[senders.indexOf(im.originator)].count =1;
  //           }else{
  //           $scope.ims[senders.indexOf(im.originator)].count +=1;
  //           }
  //         }
  //         // console.log(senders);
  //         // console.log($scope.ims);
  //       }
  //     }, function(response) {
  //       $scope.messageFetchStatus = response.status;
  //   });
  // };
  // $scope.fetchNotifications();
  // $scope.fetchMessages();
  // $scope.openChatWindow = function(url){
  //   // console.log(url);
  //   // console.log("Will open the chat window");
  //   var scope = angular.element(document.getElementById('instantMessangerCtrl')).scope();
  //   // console.log(scope);
  //   scope.$apply(function() {
  //     scope.addIMWindow(url);
  //   });
  // }

});
