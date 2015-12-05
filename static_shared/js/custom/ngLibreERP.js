var app = angular.module('app' , ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside' , 'ngDraggable' , 'flash' , 'angularRadialgraph']);

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

  $scope.fetchNotifications = function(signal) {
    // By default the signal is undefined when the user logs in. In that case it fetches all the data.
    // signal is passed by the WAMP processor for real time notification delivery.
    // console.log("going to fetch notifications");
    // console.log(toFetch);
    url = '/api/PIM/notification/';
    $scope.method = 'GET';
    if (typeof signal != 'undefined') {
      url = url + signal.id +'/';
      // console.log(signal);
      if (signal.action == 'deleted') {
        for (var i = 0; i < $scope.rawNotifications.length; i++) {
          if($scope.rawNotifications[i].url.indexOf(url) !=-1){
            // console.log("found");
            $scope.rawNotifications.splice(i , 1);
          }
        }
        $scope.refreshNotification();
      }else{

        $http({method: $scope.method, url: url}).
        then(function(response){
          var notification = response.data;
          $scope.rawNotifications.unshift(notification);
          $scope.refreshNotification();
        });
      }
      return;
    };
    $scope.rawNotifications = [];
    $http({method: $scope.method, url: url}).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        var notification = response.data[i];
        $scope.rawNotifications.push(notification);
      }
      $scope.refreshNotification();
    });
  };

  $scope.refreshNotification = function(){
    $scope.notificationParent = [];
    $scope.notifications = [];
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      var notification = $scope.rawNotifications[i];
      parts = notification.shortInfo.split(':');
      parentPk = parts[2];
      notificationType = parts[0];
      parentNotificationIndex = $scope.notificationParent.indexOf(parentPk+':'+notificationType);
      if ( parentNotificationIndex == -1){ // this is new notification for this parent of notification type

        notification.hide = false;
        notification.multi = false;
      } else { // there is already a notification for this parent
        $scope.notifications[parentNotificationIndex].multi = true;
        notification.hide = true
      };
      $scope.notifications.push(notification)
      $scope.notificationParent.push(parentPk+':'+notificationType);
    }
    $scope.notificationsCount = 0;
    for (var i = 0; i < $scope.notifications.length; i++) {
      if (! $scope.notifications[i].read ) {
        $scope.notificationsCount += 1;
      }
    }
  };

  $scope.notificationClicked = function(url){
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      if ($scope.rawNotifications[i].url.cleanUrl() == url.cleanUrl()){
        $scope.rawNotifications[i].read = true;
      }
    }
    $scope.refreshNotification();
  }

  $scope.refreshMessages = function(){
    $scope.ims = [];
    $scope.instantMessagesCount = 0;
    peopleInvolved = [];
    for (var i = 0; i < $scope.rawMessages.length; i++) {
      var im = $scope.rawMessages[i];
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
      for (var j = 0; j < $scope.rawMessages.length; j++) {
        var im = $scope.rawMessages[j];
        var friend = peopleInvolved[i];
        if (friend==im.originator || friend==im.user) {
          count = 0;
          for (var k = 0; k < $scope.rawMessages.length; k++) {
            im2 = $scope.rawMessages[k]
            if ((im2.originator == friend || im2.user == friend) && im2.read == false) {
              count += 1;
            }
          }
          if (count !=0){
            $scope.instantMessagesCount += 1;
          }
          im.count = count;
          $scope.ims.push(im);
          break;
        }
      }
    }
  }

  $scope.fetchMessages = function() {
    // This is because the chat system is build along with the notification system. Since this is the part whcih is common accros all the modules
    $scope.method = 'GET';
    $scope.url = '/api/PIM/chatMessage/';
    $scope.ims = [];
    var senders = [];

    $http({method: $scope.method, url: $scope.url}).
    then(function(response) {
      // console.log(response.data);
      $scope.rawMessages = response.data;
      $scope.refreshMessages();
    });
  };
  $scope.fetchNotifications();
  $scope.fetchMessages();

  $scope.imWindows = [ ]

  $scope.addIMWindow = function(url){
    console.log('url ' + url);
    for (var i = 0; i < $scope.rawMessages.length; i++) {
      console.log($scope.rawMessages[i].originator);
      if ($scope.rawMessages[i].originator == url && $scope.rawMessages[i].read == false){
        $scope.rawMessages[i].read = true;
        console.log("read");
      }
    }
    $scope.refreshMessages();
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
  $scope.fetchAddIMWindow = function(msgUrl){
    msgUrl += '?mode='
    $http({method: 'GET' , url : msgUrl}).
    then(function(response){
      $scope.addIMWindow(response.data.originator)
      response.data.read = true;
      $scope.rawMessages.unshift(response.data);
      $scope.refreshMessages()
    });
  };


  $scope.closeIMWindow = function(pos){
    $scope.imWindows.splice(pos, 1);
  }

});
