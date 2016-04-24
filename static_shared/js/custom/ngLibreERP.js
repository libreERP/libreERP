var app = angular.module('app' , ['ui.router', 'ui.bootstrap', 'ngSanitize', 'ngAside' , 'ngDraggable' , 'flash' , 'chart.js' , 'ngTagsInput' , 'ui.tinymce' , 'hljs']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide , hljsServiceProvider){
  hljsServiceProvider.setOptions({
    // replace tab with 4 spaces
    tabReplace: '    '
  });

  $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run([ '$rootScope', '$state', '$stateParams' , '$permissions', function ($rootScope,   $state,   $stateParams , $permissions) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  }
]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main' , function($scope , $state , $users , $aside , $http , $timeout , $uibModal , $permissions){
  $scope.me = $users.get('mySelf');
  $scope.headerUrl = '/static/ngTemplates/header.html',
  $scope.themeObj = {main : '#005173' , highlight :'#04414f'};
  $scope.dashboardAccess = false;

  $permissions.module().
  success(function(response){
    // console.log(response);
    $scope.modules = response;
    if ($scope.modules.length == 1) {
      // console.log($state);
      // console.log($state.current.name);
      if ($state.current.name.split('.').length == 1){
        // $state.go($scope.modules[0].name);
      }
    }

  });


  $http({method : 'GET' , url : '/api/PIM/settings/' + $scope.me.settings + '/'}).
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

  $scope.terminal = {command : '' , show : false};

  $scope.about = function () {
    var modalInstance = $uibModal.open({
      templateUrl: '/static/ngTemplates/about.html',
      size: 'lg',
      controller: function($scope){
      },
    });
  };


  $scope.parseCommand = function(){
    if ($scope.command == '') {
      $scope.terminal.show = false;
      return;
    }
    // parse the command
    // possible commands for the calendar app :
    // 'remind me to ask bill for the report on the project'
    // arrange a meeting with @team ELMS at 2 pm on alternate working day
    // todo code review by EOD


  };


  $scope.$watch('terminal.show' , function(newValue , oldValue){
    // once the termial is visible the timer starts , after 150 seconds is there is no command
    // in the termial then the terminal is closed
    if (newValue == false) {
      return;
    }
    $timeout(function () {
      if ($scope.terminal.command.length == 0) {
        $scope.closeTerminal();
      }
    }, 150000);
  });

  $scope.closeTerminal = function(){
    if ($scope.terminal.command.length == 0) {
      $scope.terminal.show = false;
    }
  }



  settings = {theme : $scope.themeObj , mobile : $scope.me.profile.mobile };
  $scope.openSettings = function(position, backdrop , data ) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
      $scope.me = $users.get('mySelf' , true)
      console.log($scope);
    }

    $aside.open({
      templateUrl: '/static/ngTemplates/settings.html',
      placement: position,
      size: 'md',
      backdrop: backdrop,
      controller: function($scope, $uibModalInstance  , $users , $http , Flash ) {
        emptyFile = new File([""], "");
        $scope.settings = settings;
        $scope.settings.displayPicture = emptyFile;
        $scope.me = $users.get('mySelf');
        $scope.statusMessage = '';
        $scope.settings.password='';
        $scope.cancel = function(e) {
          $uibModalInstance.dismiss();
          // e.stopPropagation();
        };

        $scope.changePassword = function(){
          if ($scope.settings.password !='' && $scope.settings.password2 == $scope.settings.password && $scope.settings.oldPassword!='') {
            $http({method : 'PATCH' , url : '/api/HR/users/'+ $scope.me.pk +'/' , data : {password : $scope.settings.password , oldPassword : $scope.settings.oldPassword}}).
            then(function(response){
              Flash.create('success', response.status + ' : ' + response.statusText );
            }, function(response){
              Flash.create('danger', response.status + ' : ' + response.statusText);
            });
          }
        }

        $scope.saveSettings = function(){
          var fdProfile = new FormData();
          if ($scope.settings.displayPicture != emptyFile) {
            fdProfile.append('displayPicture'  , $scope.settings.displayPicture);
          }
          if (isNumber($scope.settings.mobile)) {
            fdProfile.append('mobile' , $scope.settings.mobile);
          }
          $http({method : 'PATCH' , url : '/api/HR/profile/' +$scope.me.profile.pk + '/' , data : fdProfile , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
          then(function(response){
            $http({method : 'PATCH' , url : '/api/PIM/settings/'+ $scope.me.settings + '/', data : {presence : "Busy"  , user : $scope.me.pk}}).
            then(function(response){
              $http({method : 'PATCH' , url : '/api/PIM/theme/' +response.data.theme.pk + '/' , data : $scope.settings.theme}).
              then(function(response){
                $scope.changePassword();
                Flash.create('success', response.status + ' : ' + response.statusText );
              }, function(response){
                $scope.changePassword();
                Flash.create('danger', response.status + ' : ' + response.statusText );
              });
            });
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
    // console.log(signal);
    var url = '/api/PIM/notification/';
    $scope.method = 'GET';
    if (typeof signal != 'undefined') {
      url = url + signal.pk +'/';
      if (signal.action == 'deleted') {
        for (var i = 0; i < $scope.rawNotifications.length; i++) {
          if($scope.rawNotifications[i].pk == signal.pk){
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
      $scope.rawNotifications = response.data;
      $scope.refreshNotification();
    });
  };

  $scope.refreshNotification = function(){
    var notificationParent = [];
    $scope.notifications = [];
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      var notification = $scope.rawNotifications[i];
      var parts = notification.shortInfo.split(':');
      var parentPk = parts[2];
      var notificationType = parts[0];
      var parentNotificationIndex = notificationParent.indexOf(parentPk+':'+notificationType);
      if ( parentNotificationIndex == -1){ // this is new notification for this parent of notification type
        $scope.rawNotifications[i].hide = false;
      } else { // there is already a notification for this parent
        $scope.rawNotifications[i].hide = true
      };
      notificationParent.push(parentPk+':'+notificationType);
    }
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      var notification = $scope.rawNotifications[i];
      if (notification.hide == false) {
        notification.multi = false;
        for (var j = i+1; j < $scope.rawNotifications.length; j++) {
          if (notificationParent[j]==notificationParent[i]) {
            notification.multi = true;
            break;
          }
        }
        $scope.notifications.push(notification)
      }
    }
    $scope.notificationsCount = 0;
    for (var i = 0; i < $scope.notifications.length; i++) {
      if (! $scope.notifications[i].read ) {
        $scope.notificationsCount += 1;
      }
    }
  };

  $scope.notificationClicked = function(pk){
    // one the notification was clikced the directive will call this function. here i will mark the notification in the dropdown read
    for (var i = 0; i < $scope.rawNotifications.length; i++) {
      if ($scope.rawNotifications[i].pk == pk){
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
      if (im.originator == $scope.me.pk) {
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

  $scope.addIMWindow = function(pk){
    // console.log(pk);
    url = $users.get(pk).url;
    for (var i = 0; i < $scope.rawMessages.length; i++) {
      if ($scope.rawMessages[i].originator == pk && $scope.rawMessages[i].read == false){
        $scope.rawMessages[i].read = true;
      }
    }
    $scope.refreshMessages();
    if ($scope.imWindows.length<=4) {
      for (var i = 0; i < $scope.imWindows.length; i++) {
        if ($scope.imWindows[i].url == url) {
          return;
        }
      }
      me = $users.get("mySelf");
      if (url != me.url.split('?')[0]) {
        friend = $users.get(url)
        $scope.imWindows.push({url:url , username : friend.username});
      }
    }
  }
  $scope.fetchAddIMWindow = function(msgPK){
    msgPK +=
    $http({method: 'GET' , url : '/api/PIM/chatMessage/' + msgPK + '/?mode='}).
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
