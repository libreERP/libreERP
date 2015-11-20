var app = angular.module('app' , ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside' , 'ngDraggable' , 'flash']);

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
        if (response.data.theme[key] != null) {
          $scope.themeObj[key] = response.data.theme[key];
        }
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
      controller: function($scope, $uibModalInstance  , userProfileService , $http , Flash) {
        emptyFile = new File([""], "");
        $scope.settings = settings;
        $scope.settings.displayPicture = emptyFile;
        $scope.me = userProfileService.get('mySelf');
        $scope.statusMessage = '';
        $scope.settings.password='';
        $scope.cancel = function(e) {
          $uibModalInstance.dismiss();
          // e.stopPropagation();
        };

        $scope.saveSettings = function(){
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
              $http({method : 'PATCH' , url : response.data.theme.url , data : $scope.settings.theme}).
              then(function(response){
                Flash.create('success', response.status + ' : ' + response.statusText );
              }, function(response){
                Flash.create('danger', response.status + ' : ' + response.statusText );
              });
            });
            if ($scope.settings.password !='' && $scope.settings.password2 == $scope.settings.password && $scope.settings.oldPassword!='') {
              $http({method : 'PATCH' , url : $scope.me.url , data : {password : $scope.settings.password , oldPassword : $scope.settings.oldPassword}}).
              then(function(response){
                Flash.create('success', response.status + ' : ' + response.statusText);
              }, function(response){
                Flash.create('danger', response.status + ' : ' + response.statusText);
              });
            }
          });

        }
      }
    }).result.then(postClose, postClose);
  }

  $scope.fetchNotifications = function(toFetch) {
    // console.log("going to fetch notifictions");
    // console.log(toFetch);
    $scope.url = '/api/PIM/notification/';
    $scope.method = 'GET';
    console.log(typeof toFetch);
    if (typeof toFetch != 'undefined') {
      $scope.url = $scope.url + toFetch.id +'/';
      console.log($scope.url);
      $http({method: $scope.method, url: $scope.url}).
      then(function(response){
        $scope.notifications.unshift(response.data);
      } , function(response){});
      return;
    };
    $scope.notifications = [];
    $http({method: $scope.method, url: $scope.url}).
      then(function(response) {
        for (var i = 0; i < response.data.length; i++) {
          var notification = response.data[i]
          $scope.notifications.push(notification)
        }
      }, function(response) {
    });
  };
  $scope.fetchMessages = function() {
    $scope.method = 'GET';
    $scope.url = '/api/PIM/chatMessage/';
    $scope.ims = [];
    var senders = [];
    $http({method: $scope.method, url: $scope.url}).
      then(function(response) {
        $scope.messageFetchStatus = response.status;
        // console.log(response.data);
        peopleInvolved = [];
        for (var i = 0; i < response.data.length; i++) {
          var im = response.data[i];
          if (im.originator == $scope.me.url) {
            if (peopleInvolved.indexOf(im.user)==-1) {
              peopleInvolved.push(im.user)
            }
          } else{
            if (peopleInvolved.indexOf(im.originator)==-1) {
              peopleInvolved.push(im.originator)
            }
          }
        }
        for (var i = 0; i < peopleInvolved.length; i++) {
          for (var j = 0; j < response.data.length; j++) {
            var im = response.data[j];
            var friend = peopleInvolved[i];
            if (friend==im.originator || friend==im.user) {
              count = 0;
              for (var k = 0; k < response.data.length; k++) {
                im2 = response.data[k]
                if (im2.originator == friend || im2.user == friend) {
                  count += 1;
                }
              }
              im.count = count;
              $scope.ims.push(im);
              break;
            }
          }
        }
      }, function(response) {
        $scope.messageFetchStatus = response.status;
    });
  };
  $scope.fetchNotifications();
  $scope.fetchMessages();

  $scope.imWindows = [ ]

  $scope.addIMWindow = function(url){
    if ($scope.imWindows.length<=4) {
      for (var i = 0; i < $scope.imWindows.length; i++) {
        if ($scope.imWindows[i].url == url) {
          return;
        }
      }
      me = userProfileService.get("mySelf");
      if (url != me.url.split('?')[0]) {
        friend = userProfileService.get(url)
        $scope.imWindows.push({url:url , username : friend.username});
      }
    }
  }
  $scope.closeIMWindow = function(pos){
    $scope.imWindows.splice(pos, 1);
  }

});
