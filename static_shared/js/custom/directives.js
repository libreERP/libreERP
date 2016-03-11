
app.directive('breadcrumb', function () {
  return {
    templateUrl: '/static/ngTemplates/breadcrumb.html',
    restrict: 'E',
    replace: true,
    scope: false,
    controller : function($scope , $state , $stateParams){
      var stateName = $state.current.name;
      $scope.stateParts = stateName.split('.');
      for(key in $stateParams){
        if (typeof $stateParams[key] != 'undefined' && $stateParams[key] != '' && typeof parseInt($stateParams[key]) != 'number') {
          $scope.stateParts.push($stateParams[key]);
        };
      };
    },
  };
});



app.directive('genericForm', function () {
  return {
    templateUrl: '/static/ngTemplates/genericForm.html',
    restrict: 'E',
    replace: true,
    scope: {
      template : '=',
      submitFn : '&',
      data :'=',
      formTitle : '=',
      wizard : '=',
      maxPage : '=',
    },
    controller : function($scope , $state){
      $scope.page = 1;

      $scope.next = function(){
        $scope.page +=1;
        if ($scope.page>$scope.maxPage) {
          $scope.page = $scope.maxPage;
        }
      }
      $scope.prev = function(){
        $scope.page -=1;
        if ($scope.page<1) {
          $scope.page = 1;
        }
      }
    },
  };
});


app.directive('messageStrip', function () {
  return {
    templateUrl: '/static/ngTemplates/messageStrip.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      openChat :'=',
    },
    controller : function($scope , $users){
      console.log($scope.data);
      $scope.me = $users.get('mySelf');
      if ($scope.me.url.split('?')[0]==$scope.data.originator) {
        $scope.friend = $scope.data.user;
      }else{
        $scope.friend = $scope.data.originator;
      }
      $scope.clicked = function() {
        $scope.data.count =0;
        $scope.openChat($scope.friend)
      }
    }
  };
});

app.directive('notificationStrip', function () {
  return {
    templateUrl: '/static/ngTemplates/notificationStrip.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
    },
    controller : function($scope , $http , $users , $aside ){
      parts = $scope.data.shortInfo.split(':');
      // console.log(parts);
      if(typeof parts[1] == 'undefined'){
        $scope.notificationType = 'default';
      } else {
        $scope.notificationType = parts[0];
      }
      // console.log($scope.data);
      // console.log($scope.notificationType);
      nodeUrl = '/api/social/' + $scope.notificationType + '/'
      if(typeof parts[1] != 'undefined' && $scope.data.originator == 'social'){
        // console.log(nodeUrl + parts[1]);
        $http({method : 'GET' , url : nodeUrl + parts[1] + '/'}).
        then(function(response){
          $scope.friend = response.data.user;
          console.log(response.data);
          console.log($scope.notificationType);
          if ($scope.notificationType == 'postComment') {
            url = '/api/social/post/' + response.data.parent + '/';
          }else if ($scope.notificationType == 'pictureComment') {
            url = '/api/social/picture/' + response.data.parent + '/';
          }
          $http({method: 'GET' , url : url}).then(function(response){
            $scope.notificationData = response.data;
            console.log($scope.notificationData);
            if ($scope.notificationType == 'pictureComment') {
              $http({method : 'GET' , url : '/api/social/album/' +  $scope.data.shortInfo.split(':')[3] + '/?user=' + $users.get($scope.notificationData.user).username}).
              then(function(response){
                $scope.objParent = response.data;
              });
            };
          });
        });
      };

      $scope.openAlbum = function(position, backdrop , input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.album.html',
          placement: position,
          size: 'lg',
          backdrop: backdrop,
          controller: 'controller.social.aside.picture',
          resolve: {
           input: function () {
             return input;
            }
          }
        }).result.then(postClose, postClose);
      }

      $scope.openPost = function(position, backdrop , input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/app.social.aside.post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller:'controller.social.aside.post',
          resolve: {
           input: function () {
             return input;
            }
          }
        }).result.then(postClose, postClose);
      }
      $scope.openNotification = function(){
        $http({method: 'PATCH' , url : $scope.data.url , data : {read : true}}).
        then(function(response){
          $scope.$parent.notificationClicked($scope.data.url);
          $scope.data.read = true;
        });
        if ($scope.notificationType == 'postLike' || $scope.notificationType == 'postComment') {
          $scope.openPost('right', true , {data: $scope.notificationData , onDelete: function(){return;}})
        } else if ($scope.notificationType == 'pictureLike' || $scope.notificationType == 'pictureComment') {

          console.log($scope.objParent);
          $scope.openAlbum('right', true , {data: $scope.notificationData , parent : $scope.objParent , onDelete: ""})
        }
      }
    },
  };
});


app.directive('chatWindow', function ($users) {
  return {
    templateUrl: '/static/ngTemplates/chatWindow.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      friendUrl : '=',
      pos : '=',
      cancel :'&',
    },
    controller : function($scope ,$location,  $anchorScroll, $http, $templateCache, $timeout){
      // console.log($scope.pos);
      $scope.me = $users.get("mySelf");
      $scope.friend = $users.get($scope.friendUrl);
      // console.log($scope.friend);
      $scope.isTyping = false;
      $scope.toggle = true;
      $scope.messageToSend = "";
      $scope.status = "N"; // neutral / No action being performed
      $scope.send = function(){
        console.log("going to publish" + $scope.messageToSend);
        msg = angular.copy($scope.messageToSend)
        if (msg!="") {
          $scope.status = "M"; // contains message
          dataToSend = {message:msg , user: $scope.friend.pk , read:false};
          $http({method: 'POST', data:dataToSend, url: '/api/PIM/chatMessage/'}).
          then(function(response){
            $scope.ims.push(response.data)
            $scope.senderIsMe.push(true);
            connection.session.publish('service.chat.'+$scope.friend.username, [$scope.status , response.data.message , $scope.me.username , response.data.pk], {}, {acknowledge: true}).
            then(function (publication) {});
            $scope.messageToSend = "";
          })
        }
      }; // send function

      $scope.addMessage = function(msg , url){
        $http({method : 'PATCH' , url : '/api/PIM/chatMessage/' +url + '/?mode=' , data : {read : true}}).
        then(function(response) {
          $scope.ims.push(response.data);
          $scope.senderIsMe.push(false);
        });
      };

      $scope.fetchMessages = function() {
        $scope.method = 'GET';
        $scope.url = '/api/PIM/chatMessageBetween/?other='+$scope.friend.username;
        $scope.ims = [];
        $scope.imsCount = 0;
        $scope.senderIsMe = [];
        $http({method: $scope.method, url: $scope.url}).
        then(function(response) {
          $scope.imsCount = response.data.length;
          for (var i = 0; i < response.data.length; i++) {
            var im = response.data[i];
            sender = $users.get(im.originator)
            if (sender.username == $scope.me.username) {
              $scope.senderIsMe.push(true);
            }else {
              $scope.senderIsMe.push(false);
            }
            $scope.ims.push(im);
            // console.log($scope.ims.length);
          }
        });
      };
      $scope.fetchMessages();
      $scope.scroll = function(){
        var $id= $("#scrollArea"+$scope.pos);
        $id.scrollTop($id[0].scrollHeight);
      }
    },
    // attrs is the attrs passed from the main scope
    link: function postLink(scope, element, attrs) {
      scope.$watch('messageToSend', function(newValue , oldValue ){
        // console.log("changing");
        scope.status = "T"; // the sender is typing a message
        if (newValue!="") {
          connection.session.publish('service.chat.'+ scope.friend.username, [scope.status , scope.messageToSend , scope.me.username]);
        }
        scope.status = "N";
      }); // watch for the messageTosend
      scope.$watch('ims.length', function( ){
        setTimeout( function(){
          scope.scroll();
        }, 500 );
      });
      scope.$watch('pos', function( newValue , oldValue){
        // console.log(newValue);
        scope.location = 30+newValue*320;
        // console.log("setting the new position value");
        // console.log();
      });
    } // link
  };
});
