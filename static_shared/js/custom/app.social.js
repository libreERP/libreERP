app.directive('commentBubble', function () {
  return {
    templateUrl:'/static/ngTemplates/commentBubble.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      onDelete : '&',
    },
    controller : function($scope, $http , userProfileService){
      $scope.me = userProfileService.get("mySelf");
      $scope.liked = false;
      for (var i = 0; i < $scope.data.likes.length; i++) {
        if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
          $scope.liked = true;
          break;
        }
      }
      if ($scope.data.user.split('?')[0]==$scope.me.url){
        $scope.iCommented = true;
      } else {
        $scope.iCommented = false;
      }
      $scope.like = function(){
        if ($scope.liked) {
          for (var i = 0; i < $scope.data.likes.length; i++) {
            if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
              index = i;
              console.log($scope.data.likes[i]);
              $http({method: 'DELETE', url: $scope.data.likes[i].url}).
                then(function(response , index) {
                  $scope.data.likes.splice(index, 1);
                  $scope.liked = false;
                }, function(response) {
                  // console.log("failed to sent the comment");
              });
            }
          }
        } else {
          dataToSend = {parent: $scope.data.url.split('?')[0] , user: $scope.data.user};
          // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
          $http({method : 'PATCH' , url : $scope.data.url }).
          then(function(response){
            // console.log(response);
            for (var i = 0; i < response.data.likes.length; i++) {
              if (response.data.likes[i].user.split('?')[0] == $scope.me.url){
                $scope.data.likes.push(response.data.likes[i])
              }
            }
            $scope.liked = true;
          }, function(response){

          });
        }
      }
      $scope.delete = function(){
        $http({method : 'DELETE' , url : $scope.data.url }).
        then(function(response){
          $scope.onDelete();

        }, function(response){

        });
      }
    },
  };
});

app.directive('post', function () {
  return {
    templateUrl: '/static/ngTemplates/postBubble.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      onDelete :'&',
    },
    controller : function($scope, $http , $timeout , userProfileService , $aside , $interval , $window) {
      $scope.openPost = function(position, backdrop , input) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/post.html',
          placement: position,
          size: 'md',
          backdrop: backdrop,
          controller: function($scope, $modalInstance ) {
            $scope.me = userProfileService.get("mySelf");
            // console.log($scope);
            $scope.data = input.data;
            $scope.onDelete = input.onDelete;
            $scope.possibleCommentHeight = 70; // initial height percent setting
            $scope.textToComment = "";
            $scope.viewMode = 'comments';
            $scope.liked = false;
            for (var i = 0; i < $scope.data.likes.length; i++) {
              if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
                $scope.liked = true;
                break;
              }
            }
            if ($scope.data.user.split('?')[0] == $scope.me.url) {
              $scope.isOwner = true;
            } else {
              $scope.isOwner = false;
            }
            setTimeout(function () {
              postBodyHeight = $("#postModalBody").height();
              inputHeight = $("#commentInput").height();
              winHeight = $(window).height();
              defaultHeight = postBodyHeight + 5.7*inputHeight;
              $scope.commentsHeight = Math.floor(100*(winHeight - defaultHeight)/winHeight);
              $scope.$apply();
              scroll("#commentsArea");
            }, 100);
            $scope.comment = function(){
              if ($scope.textToComment == "") {
                return;
              }
              dataToSend = {text: $scope.textToComment , parent: $scope.data.url.split('?')[0] , user: $scope.data.user };
              // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
              $http({method: 'POST', data:dataToSend, url: '/api/socialPostComment/'}).
                then(function(response) {
                  $scope.data.comments.push(response.data)
                  $scope.textToComment = "";
                  $scope.viewMode = 'comments';
                  setTimeout(function () {
                    scroll("#commentsArea");
                  }, 100);
                }, function(response) {
                  // console.log("failed to sent the comment");
              });
            }
            $scope.deleteComment = function(index){
              $scope.data.comments.splice(index , 1);
            }

            $scope.like = function(){
              if ($scope.liked) {
                for (var i = 0; i < $scope.data.likes.length; i++) {
                  if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
                    index = i;
                    $http({method: 'DELETE', url: $scope.data.likes[i].url}).
                      then(function(response , index) {
                        $scope.data.likes.splice(index, 1);
                        $scope.liked = false;
                      }, function(response) {
                        // console.log("failed to sent the comment");
                    });
                  }
                }
              } else {
                dataToSend = {parent: $scope.data.url.split('?')[0] , user: $scope.data.user};
                // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
                $http({method: 'POST', data:dataToSend, url: '/api/socialPostLike/'}).
                  then(function(response) {
                    $scope.liked = true;
                    $scope.data.likes.push(response.data)
                  }, function(response) {
                    // console.log("failed to sent the comment");
                });
              }
            }
            $scope.enableEdit = function(){
              $scope.editMode = true;
              $scope.backupText = angular.copy($scope.data.text);
            }
            $scope.save = function(){
              var fd = new FormData();
              var f = new File([""], "");
              fd.append('attachment', f);
              fd.append('text' , $scope.data.text );
              fd.append('user' , $scope.me.url);
              var url = $scope.data.url;
              $http({method : 'PATCH' , url : url, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
              then(function(response){
                $scope.editMode = false;
              } , function(response){

              });
            }
            $scope.cancelEditor = function(){
              $scope.data.text = $scope.backupText;
              $scope.editMode = false;
            }

            $scope.delete = function(data){
              $http({method : 'DELETE' , url : $scope.data.url}).
              then(function(response){
                $scope.onDelete();
                $modalInstance.close();
              } , function(response){

              });
            }
          }
        }).result.then(postClose, postClose);
      }

    },
  };
});

app.directive('album', function () {
  return {
    template:'<li>'+
        '<i class="fa fa-camera bg-purple"></i>'+
        '<div class="timeline-item">'+
          '<span class="time"><i class="fa fa-clock-o"></i> {{data.created | timeAgo}} ago</span>'+
          '<h3 class="timeline-header"><a href="#">{{data.user | getName}}</a> uploaded new photos to album : {{data.title}}</h3>'+
          '<div class="timeline-body">'+
            '<div ng-repeat = "picture in data.photos" style="display: inline;">'+
              '<img ng-click="openAlbum('+"'right'"+ ', true , picture , data)" ng-src="{{picture.photo}}" alt="..." class="margin" height="100px" width="150px" >'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</li>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
    },
    controller : function($scope, $http , $timeout , userProfileService , $aside , $interval , $window) {
      $scope.openAlbum = function(position, backdrop , data , parent) {
        $scope.asideState = {
          open: true,
          position: position
        };

        function postClose() {
          $scope.asideState.open = false;
        }

        $aside.open({
          templateUrl: '/static/ngTemplates/album.html',
          placement: position,
          size: 'lg',
          backdrop: backdrop,
          controller: function($scope, $modalInstance ) {
            $scope.me = userProfileService.get("mySelf");
            $scope.data = data;
            $scope.parent = parent;
            console.log($scope.parent);
            $scope.possibleCommentHeight = 70;
            $scope.textToComment = "";
            $scope.viewMode = 'comments';
            $scope.liked = false;
            for (var i = 0; i < $scope.data.likes.length; i++) {
              if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
                $scope.liked = true;
                break;
              }
            }
            setTimeout(function () {
              postBodyHeight = $("#postModalBody").height();
              inputHeight = $("#commentInput").height();
              winHeight = $(window).height();
              defaultHeight = postBodyHeight + 6*inputHeight;
              $scope.commentsHeight = Math.floor(100*(winHeight - defaultHeight)/winHeight);
              $scope.$apply();
              scroll("#commentsArea");
            }, 100);
            $scope.comment = function(){
              if ($scope.textToComment == "") {
                return;
              }
              dataToSend = {text: $scope.textToComment , parent: $scope.data.url.split('?')[0] , user: $scope.data.user };
              // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
              $http({method: 'POST', data:dataToSend, url: '/api/socialPictureComment/'}).
                then(function(response) {
                  $scope.textToComment = "";
                  $scope.data.comments.push(response.data)
                  $scope.viewMode = 'comments';
                  setTimeout(function () {
                    scroll("#commentsArea");
                  }, 100);
                }, function(response) {
                  // console.log("failed to sent the comment");

              });
            }
            $scope.deleteComment = function(index){
              $scope.data.comments.splice(index , 1);
            }

            $scope.like = function(){
              if ($scope.liked) {
                for (var i = 0; i < $scope.data.likes.length; i++) {
                  if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
                    index = i;
                    $http({method: 'DELETE', url: $scope.data.likes[i].url}).
                      then(function(response , index) {
                        $scope.data.likes.splice(index, 1);
                        $scope.liked = false;
                      }, function(response) {
                        // console.log("failed to sent the comment");
                    });
                  }
                }
              } else {
                dataToSend = {parent: $scope.data.url.split('?')[0] , user: $scope.data.user};
                // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
                $http({method: 'POST', data:dataToSend, url: '/api/socialPictureLike/'}).
                  then(function(response) {
                    $scope.liked = true;
                    $scope.data.likes.push(response.data)
                  }, function(response) {
                    // console.log("failed to sent the comment");
                });
              }
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});

app.controller('socialController', function($scope , $http , $timeout , userProfileService , $aside , $interval , $window) {

  $scope.me = userProfileService.get('mySelf');
  $scope.user = $scope.me;
  $scope.user.albums = userProfileService.social(user.username , 'albums');
  $scope.user.posts = userProfileService.social(user.username , 'post');
  $scope.user.pictures = userProfileService.social(user.username , 'pictures');
  $scope.droppedObjects = [];
  $scope.statusMessage = '';
  $scope.picturePost = {photo : {}};

  $scope.refreshFeeds = function(){

    orderMat = [];
    for (var i = 0; i < $scope.user.posts.length; i++) {
      orderMat.push( {created : $scope.user.posts[i].created , type: 'post', index : i })
    }
    for (var i = 0; i < $scope.user.albums.length; i++) {
      orderMat.push( {created : $scope.user.albums[i].created , type: 'album', index : i })
    }
    $scope.rawFeeds = angular.copy(orderMat);

    orderMat.sortIndices(function(b, a) { return new Date(a.created).getTime() - new Date(b.created).getTime(); });
    $scope.sortedFeeds = [];
    for (var i = 0; i < orderMat.length; i++) {
      $scope.sortedFeeds.push( $scope.rawFeeds[orderMat[i]] )
    }
  }
  $scope.refreshFeeds();

  $scope.views = [{name : 'drag' , icon : '' , template : '/static/ngTemplates/draggablePhoto.html'} ];
  $scope.getParams = [{key : 'albumEditor', value : ''}, {key : 'user' , value : 'pradeep'}];

  $scope.removeFromTempAlbum = function(index){
    pic = $scope.droppedObjects[index];
    $scope.droppedObjects.splice(index , 1);
    $scope.draggableObjects.push(pic);
  }
  $scope.tempAlbum = {title : '' , photos : []};
  $scope.createAlbum = function(){
    if ($scope.droppedObjects.length == 0) {
      $scope.status = 'danger';
      $scope.statusMessage = 'No photo selected';
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
      return;
    }
    for (var i = 0; i < $scope.droppedObjects.length; i++) {
      uri = $scope.droppedObjects[i].url.split('/?')[0];
      // nested request is not supported by the django rest framework so sending the PKs of the photos to the create function in the serializer
      pk = uri.split('socialPicture/')[1];
      $scope.tempAlbum.photos.push(pk);
    }
    dataToPost = {
      user : $scope.me.url,
      title : $scope.tempAlbum.title,
      photos : $scope.tempAlbum.photos,
    };
    // console.log(dataToPost);
    $http({method: 'POST' , data : dataToPost , url : '/api/socialAlbum/'}).
    then(function(response){
      $scope.tempAlbum = {title : '' , photos: []};
      $scope.droppedObjects = [];
      $scope.statusMessage = "Posted";
      $scope.status = 'success';
      if ($scope.user.url == $scope.me.url) {
        $scope.user.albums.push(response.data);
        $scope.refreshFeeds();
      }
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
    },function(response){
      $scope.status = 'danger';
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
    });
  }
  $scope.removePost = function(index){
    $scope.user.posts.splice(index, 1);
    $scope.refreshFeeds();
  }
  $scope.onDropComplete=function(data,evt){
    var index = $scope.droppedObjects.indexOf(data);
    if (index == -1){
      $scope.droppedObjects.push(data);
      var index = $scope.draggableObjects.indexOf(data);
      $scope.draggableObjects.splice(index , 1);
    }
  }
  var f = new File([""], "");
  $scope.post = {attachment : f , text: ''};
  $scope.publishPost = function(){
    var fd = new FormData();
    fd.append('attachment', $scope.post.attachment);
    fd.append('text' , $scope.post.text );
    fd.append('user' , $scope.me.url);
    var uploadUrl = "/api/socialPost/";
    $http({method : 'POST' , url : uploadUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.post = {attachment : f , text: ''};
      $scope.statusMessage = "Posted";
      $scope.status = 'success';
      if ($scope.user.url == $scope.me.url) {
        $scope.user.posts.push(response.data);
        $scope.refreshFeeds();
      }
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
    },function(response){
      $scope.status = 'danger';
      $scope.statusMessage = response.status + ' : ' + response.statusText;
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
    });
  };
  $scope.uploadImage = function(){
    var fd = new FormData();
    fd.append('photo', $scope.picturePost.photo);
    fd.append('tagged' , '');
    fd.append('user' , $scope.me.url);
    var uploadUrl = "/api/socialPicture/";
    $http({method : 'POST' , url : uploadUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.picturePost = {photo : {}};
      $scope.statusMessage = "Uploaded";
      if ($scope.user.url == $scope.me.url) {
        $scope.user.pictures.push(response.data);
        $scope.status = 'success';
      }
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);

    },function(response){
      $scope.status = 'danger';
      $scope.statusMessage = response.status + ' : ' +  response.statusText;
      setTimeout(function () {
        $scope.statusMessage = '';
        $scope.status = '';
        $scope.$apply();
      }, 4000);
    });
  };
});

scroll = function(element){
  var $id= $(element);
  $id.scrollTop($id[0].scrollHeight);
}
