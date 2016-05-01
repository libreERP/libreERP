
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

app.directive('usersField', function () {
  return {
    templateUrl: '/static/ngTemplates/usersInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data :'=',
      url : '@',
      col : '@',
      label : '@',
    },
    controller : function($scope , $state , $http , Flash){
        if (typeof $scope.col != 'undefined') {
            $scope.showResults = true;
        }else{
            $scope.showResults = false;
        }
        $scope.user = undefined;
        $scope.userSearch = function(query) {
          return $http.get( $scope.url +'?username__contains=' + query).
          then(function(response){
              for (var i = 0; i < response.data.length; i++) {
                  if ($scope.data.indexOf(response.data[i]) != -1){
                      response.data.splice(i,1);
                  }
              }
            return response.data;
          })
        };
        $scope.getName = function(u) {
          if (typeof u == 'undefined') {
            return '';
          }
          return u.first_name + '  ' +u.last_name;
        }

        $scope.addUser = function() {
          for (var i = 0; i < $scope.data.length; i++) {
            if ($scope.data[i] == $scope.user.pk){
              Flash.create('danger' , 'User already a member of this group')
              return;
            }
          }
          $scope.data.push($scope.user.pk);
          $scope.user = undefined;
        }
    },
  };
});

app.directive('mediaField', function () {
  return {
    templateUrl: '/static/ngTemplates/mediaInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data :'=',
      url : '@',
    },
    controller : function($scope , $state , $http , Flash){
        $scope.form = {mediaType : '' , url : ''}
        $scope.switchMediaMode = function(mode) {
            $scope.form.mediaType = mode;
        }

        $scope.getFileName = function(f) {
            var parts = f.split('/');
            return parts[parts.length-1];
        }

        $scope.removeMedia = function(index) {
            $http({
                method : 'DELETE',
                url : $scope.url  + $scope.data[index].pk + '/'
            }).
            then(function(response) {
                $scope.data.splice(index,1);
            })
        }
        $scope.postMedia = function(){
            var fd = new FormData();
            fd.append( 'mediaType' , $scope.form.mediaType);
            fd.append( 'link' , $scope.form.url);
            if (['doc' , 'image' , 'video'].indexOf($scope.form.mediaType) != -1 && $scope.form.file != emptyFile) {
                fd.append( 'attachment' ,$scope.form.file);
            }else if ($scope.form.url == '') {
                Flash.create('danger' , 'No file to attach');
                return;
            }
            url = $scope.url;
            $http({method : 'POST' , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
            then(function(response){
                $scope.data.push(response.data);
                $scope.form.file = emptyFile;
                Flash.create('success', response.status + ' : ' + response.statusText);
            }, function(response){
                Flash.create('danger', response.status + ' : ' + response.statusText);
            });
        }
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
      var parts = $scope.data.shortInfo.split(':');
      // console.log(parts);
      if(typeof parts[1] == 'undefined'){
        $scope.notificationType = 'default';
      } else {
        $scope.notificationType = parts[0];
      }
      // console.log($scope.data);
      // console.log($scope.notificationType);
      var nodeUrl = '/api/social/' + $scope.notificationType + '/'
      if(typeof parts[1] != 'undefined' && $scope.data.originator == 'social'){
        // console.log(nodeUrl + parts[1]);
        $http({method : 'GET' , url : nodeUrl + parts[1] + '/'}).
        then(function(response){
          $scope.friend = response.data.user;
          if ($scope.notificationType == 'postComment') {
            var url = '/api/social/post/' + response.data.parent + '/';
          }else if ($scope.notificationType == 'pictureComment') {
            var url = '/api/social/picture/' + response.data.parent + '/';
          }
          $http({method: 'GET' , url : url}).then(function(response){
            $scope.notificationData = response.data;
            if ($scope.notificationType == 'pictureComment') {
              $http({method : 'GET' , url : '/api/social/album/' +  $scope.data.shortInfo.split(':')[3] + '/?user=' + $users.get($scope.notificationData.user).username}).
              then(function(response){
                $scope.objParent = response.data;
              });
            };
          });
        });
      }else if (typeof parts[1] != 'undefined' && $scope.data.originator == 'git') {
        if (parts[0] == 'codeComment') {
          var url = '/api/git/commitNotification/?sha=' + parts[2];
          $http({method : 'GET' , url : url}).
          then(function(response) {
            $scope.commit = response.data[0];
          });
          var url = '/api/git/codeComment/' + parts[1] + '/';
          $http({method : 'GET' , url : url}).
          then(function(response) {
            $scope.codeComment = response.data;
          });
        }
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

      $scope.openCommit = function() {
        $aside.open({
          templateUrl : '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
          position:'left',
          size : 'xxl',
          backdrop : true,
          resolve : {
            input : function() {
              return $scope.commit;
            }
          },
          controller : 'projectManagement.GIT.exploreNotification',
        })
      }

      $scope.openNotification = function(){
        $http({method: 'PATCH' , url : '/api/PIM/notification/'+$scope.data.pk +'/' , data : {read : true}}).
        then(function(response){
          $scope.$parent.notificationClicked($scope.data.pk);
          $scope.data.read = true;
        });
        if ($scope.notificationType == 'postLike' || $scope.notificationType == 'postComment') {
          $scope.openPost('right', true , {data: $scope.notificationData , onDelete: function(){return;}})
        } else if ($scope.notificationType == 'pictureLike' || $scope.notificationType == 'pictureComment') {
          $scope.openAlbum('right', true , {data: $scope.notificationData , parent : $scope.objParent , onDelete: ""})
        }else if ($scope.notificationType == 'codeComment') {
          $scope.openCommit()
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
