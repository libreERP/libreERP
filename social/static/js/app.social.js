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
          controller:'postAsideCtrl',
          resolve: {
           input: function () {
             return input;
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});

app.controller('postAsideCtrl' , function($scope, $uibModalInstance , $http, userProfileService , input) {
  $scope.me = userProfileService.get("mySelf");
  $scope.data = input.data;
  $http({method: 'GET' , url : $scope.data.url}).
  then(function(requests){
    for(key in requests.data){
      $scope.data[key] = requests.data[key];
    }
  });
  $scope.onDelete = input.onDelete;
  $scope.possibleCommentHeight = 70; // initial height percent setting
  $scope.textToComment = "";
  $scope.viewMode = 'comments';
  $scope.liked = false;
  if (typeof $scope.data == 'undefined') {
    return;
  }
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

  $scope.refreshAside = function(signal){
    console.log(signal);

    var nodeUrl = '/api/social/';
    if (signal.action == 'created') {
      if (typeof signal.parent == 'number'){
        updateType = signal.type.split('.')[1];

        if (updateType == 'commentLike') {
          pk = signal.parent;
          url = nodeUrl + 'postComment';
        } else {
          pk = signal.id;
          url = nodeUrl + updateType;
        }
        $http({method : 'GET' , url : url + '/' + pk +'/'}).
        then(function(response){
          if (response.data.parent == $scope.data.url.split('?')[0]) {
            if (updateType == 'postLike') {
              $scope.data.likes.push(response.data);
              if (response.data.user == $scope.me.url) {
                $scope.liked = true;
              }
            } else if (updateType == 'postComment') {
              $scope.data.comments.push(response.data);
            } else if (updateType == 'commentLike') {
              $http({method : 'GET' , url : nodeUrl + updateType + '/' + signal.id +'/'}).
              then(function(response){
                for (var i = 0; i < $scope.data.comments.length; i++) {
                  if( $scope.data.comments[i].url.indexOf(url + '/' + pk +'/') != -1) {
                    $scope.data.comments[i].likes.push(response.data);
                  }
                }
              })
            }
          }
        });
      } else {
        $http({method : 'GET' , url : '/api/PIM/notification/' + signal.id +'/'}).
        then(function(response){
          parts = response.data.shortInfo.split(':');
          updateType = parts[0];
          if (updateType == 'postLike') {
            $http({method : 'GET' , url : '/api/social/postLike/' + parts[1] +'/'}).
            then(function(response){
              if (response.data.parent == $scope.data.url.split('?')[0]) {
                $scope.data.likes.push(response.data);
                if (response.data.user == $scope.me.url) {
                  $scope.liked = true;
                }
              }
            });
          }else if (updateType == 'postComment') {
            $http({method : 'GET' , url : '/api/social/postComment/' + parts[1] +'/'}).
            then(function(response){
              if (response.data.parent == $scope.data.url.split('?')[0]) {
                $scope.data.comments.push(response.data);
              }
            });
          };
        });
      }
    }else if (signal.action == 'deleted'){
      if (typeof signal.parent == 'number'){
        id = signal.id;

      }else{
        id = signal.objID;
      }
      updateType = signal.type.split('.')[1];
      if (updateType == 'postComment') {

        for (var i = 0; i < $scope.data.comments.length; i++) {
          if ($scope.data.comments[i].url.indexOf( nodeUrl + updateType + '/'+ id) != -1){
            $scope.data.comments.splice(i, 1);
          }
        }
      } else if (updateType == 'postLike') {

        for (var i = 0; i < $scope.data.likes.length; i++) {
          if ($scope.data.likes[i].url.indexOf( nodeUrl + updateType + '/'+ id) != -1){
            $scope.data.likes.splice(i, 1);
            for (var i = 0; i < $scope.data.likes.length; i++) {
              if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
                $scope.liked = true;
                break;
              }
            }
          }
        };
      } else if (updateType == 'commentLike') {
        for (var i = 0; i < $scope.data.comments.length; i++) {
          for (var j = 0; j < $scope.data.comments[i].likes.length; j++) {
            console.log(nodeUrl + updateType + '/' + signal.id);
            if($scope.data.comments[i].likes[j].url.indexOf(nodeUrl + updateType + '/' + signal.id) != -1) {
              $scope.data.comments[i].likes.splice(j,1);
            }
          }
        }
      }
    } // if - else
    scroll("#commentsArea");
  };
  $scope.comment = function(){
    if ($scope.textToComment == "") {
      return;
    }
    dataToSend = {text: $scope.textToComment , parent: $scope.data.url.split('?')[0] , user: $scope.data.user };
    // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
    $http({method: 'POST', data:dataToSend, url: '/api/social/postComment/'}).
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
      $http({method: 'DELETE', url: $scope.data.likes[i].url}).
        then(function(response) {
          for (var i = 0; i < $scope.data.likes.length; i++) {
            if ($scope.data.likes[i].user.split('?')[0] == $scope.me.url) {
              $scope.data.likes.splice(i, 1);
              $scope.liked = false;
            }
          }
        }, function(response) {
          // console.log("failed to sent the comment");
      });

    } else {
      dataToSend = {parent: $scope.data.url.split('?')[0] , user: $scope.data.user};
      // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
      $http({method: 'POST', data:dataToSend, url: '/api/social/postLike/'}).
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

  $scope.delete = function(){
    $http({method : 'DELETE' , url : $scope.data.url}).
    then(function(response){
      $scope.onDelete();
      $uibModalInstance.close();
    } , function(response){

    });
  }
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
              '<img ng-click="openAlbum('+"'right'"+ ', true , picture , data , albumDelete)" ng-src="{{picture.photo}}" alt="..." class="margin" height="100px" width="150px" >'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</li>',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      albumDelete :'&',
    },
    controller : function($scope, $http , $timeout , userProfileService , $aside , $interval , $window) {
      $scope.openAlbum = function(position, backdrop , data , parent , albumDelete) {
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
          controller: function($scope, $uibModalInstance , Flash) {
            $scope.me = userProfileService.get("mySelf");
            $scope.data = data;
            $scope.parent = parent;
            $scope.views = [{name : 'drag' , icon : '' , template : '/static/ngTemplates/draggablePhoto.html'} ];
            $scope.getParams = [{key : 'albumEditor', value : ''}, {key : 'user' , value : $scope.me.username}];
            $scope.droppedObjects = angular.copy($scope.parent.photos);
            $scope.tempAlbum = {title :  $scope.parent.title , photos : []};
            $scope.editorData = {draggableObjects : []};
            $scope.editMode = false;
            $scope.albumDelete = albumDelete;
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
            if ($scope.data.user.split('?')[0] == $scope.me.url) {
              $scope.isOwner = true;
            } else {
              $scope.isOwner = false;
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
              $http({method: 'POST', data:dataToSend, url: '/api/social/pictureComment/'}).
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
            $scope.deletePhoto = function(){
              $http({method : 'DELETE' , url : $scope.data.url}).
              then(function(response){
                for (var i = 0; i < $scope.parent.photos.length; i++) {
                  if ($scope.parent.photos[i].url == $scope.data.url){
                    $scope.parent.photos.splice(i, 1);
                    if (i == 0 && $scope.parent.photos.length == 0) {
                      $scope.deleteAlbum()
                    }else{
                      if ($scope.parent.photos.length <= i+1) {
                        $scope.data = $scope.parent.photos[i-1];
                      } else {
                        $scope.data = $scope.parent.photos[i];
                      }
                    }
                  }
                }
              } , function(response){

              });
            }
            $scope.edit = function(){
              $scope.editMode = true;
            }
            $scope.deleteAlbum = function(){
              $http({method : 'DELETE' , url : $scope.parent.url}).
              then(function(response){
                $scope.albumDelete();
                // calling the album Delete function passed with the open Album Aside function to refresh the feeds
                $uibModalInstance.close();
              } , function(response){

              });
            }
            $scope.deleteComment = function(index){
              $scope.data.comments.splice(index , 1);
            }
            $scope.removeFromTempAlbum = function(index){
              pic = $scope.droppedObjects[index];
              $scope.droppedObjects.splice(index , 1);
              $scope.editorData.draggableObjects.push(pic);
            }
            $scope.updateAlbum = function(){
              if ($scope.droppedObjects.length == 0) {
                Flash.create('danger', 'No photos in the album' );
                return;
              }
              for (var i = 0; i < $scope.droppedObjects.length; i++) {
                uri = $scope.droppedObjects[i].url.split('/?')[0];
                // nested request is not supported by the django rest framework so sending the PKs of the photos to the create function in the serializer
                pk = uri.split('picture/')[1].split('/')[0];
                $scope.tempAlbum.photos.push(pk);
              }
              dataToPost = {
                user : $scope.me.url,
                title : $scope.tempAlbum.title,
                photos : $scope.tempAlbum.photos,
              };
              // console.log(dataToPost);
              $http({method: 'PATCH' , data : dataToPost , url : $scope.parent.url}).
              then(function(response){
                Flash.create('success', response.status + ' : ' + response.statusText );
                $scope.parent.title = response.data.title;
                $scope.parent.photos = response.data.photos;
              }, function(response){
                Flash.create('danger', response.status + ' : ' + response.statusText );
              });
            }
            $scope.onDropComplete=function(data,evt){
              var index = $scope.droppedObjects.indexOf(data);
              if (index == -1){
                $scope.droppedObjects.push(data);
                var index = $scope.editorData.draggableObjects.indexOf(data);
                $scope.editorData.draggableObjects.splice(index , 1);
              }
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
                $http({method: 'POST', data:dataToSend, url: '/api/social/pictureLike/'}).
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
app.directive('socialProfile', function () {
  return {
    templateUrl: '/static/ngTemplates/app.social.profile.html',
    restrict: 'E',
    replace: false,
    scope: {
      userUrl : '=',
    },
    controller : 'socialProfileController',
  };
});

app.controller('socialProfileController', function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash) {
  emptyFile = new File([""], "");
  $scope.me = userProfileService.get('mySelf')
  $scope.user = userProfileService.get($scope.userUrl, true);
  $scope.ready = 0;
  var feedsItems = ['album' , 'post' , 'picture'];
  for (var i = 0; i < feedsItems.length; i++){
    mode = feedsItems[i];
    $http({method : 'GET' , url : '/api/social/' + mode +'/?format=json&user='+ $scope.user.username}).
    then(function(response){
      if (response.config.url.indexOf('album') != -1) {
        $scope.user.albums = response.data;
        $scope.ready += 1;
      } else if (response.config.url.indexOf('post') != -1) {
        $scope.user.posts = response.data;
        $scope.ready += 1;
      } else if (response.config.url.indexOf('picture') != -1) {
        $scope.user.pictures = response.data;
        $scope.ready += 1;

      }
    })
  }


  $scope.droppedObjects = [];
  $scope.editorData = {draggableObjects : []}; // for the album editor
  $scope.statusMessage = '';
  $scope.picturePost = {photo : {}};
  if ($scope.user.username == $scope.me.username) {
    $scope.myProfile = true;
  }else {
    $scope.myProfile = false;
  }
  $http({method:'GET' , url : $scope.user.social}).then(
    function(response){
      $scope.user.socialData = response.data;
      $scope.user.socialData.coverPicFile = emptyFile;
    }
  )
  $http({method:'GET' , url : $scope.user.designation}).then(
    function(response){
      $scope.user.designationData = response.data;
    }
  )

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
  $scope.$watch('ready' , function(newValue , oldValue){
    if (newValue == 3) {
      $scope.refreshFeeds()
    }
  })


  $scope.views = [{name : 'drag' , icon : '' , template : '/static/ngTemplates/draggablePhoto.html'} ];
  $scope.getParams = [{key : 'albumEditor', value : ''}, {key : 'user' , value : $scope.user.username}];

  $scope.removeFromTempAlbum = function(index){
    pic = $scope.droppedObjects[index];
    $scope.droppedObjects.splice(index , 1);
    $scope.editorData.draggableObjects.push(pic);
  }
  $scope.tempAlbum = {title : '' , photos : []};
  $scope.createAlbum = function(){
    if ($scope.droppedObjects.length == 0) {
      Flash.create('danger', 'No photos in the album' );
      return;
    }
    for (var i = 0; i < $scope.droppedObjects.length; i++) {
      uri = $scope.droppedObjects[i].url.split('/?')[0];
      // nested request is not supported by the django rest framework so sending the PKs of the photos to the create function in the serializer
      pk = uri.split('picture/')[1];
      $scope.tempAlbum.photos.push(pk);
    }
    dataToPost = {
      user : $scope.me.url,
      title : $scope.tempAlbum.title,
      photos : $scope.tempAlbum.photos,
    };
    // console.log(dataToPost);
    $http({method: 'POST' , data : dataToPost , url : '/api/social/album/'}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.tempAlbum.title = '';
      $scope.tempAlbum.photos = [];
      $scope.droppedObjects = [];
      $scope.user.albums.push(response.data);
      $scope.refreshFeeds();
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  }
  $scope.onDropComplete=function(data,evt){
    var index = $scope.droppedObjects.indexOf(data);
    if (index == -1){
      $scope.droppedObjects.push(data);
      var index = $scope.editorData.draggableObjects.indexOf(data);
      $scope.editorData.draggableObjects.splice(index , 1);
    }
  }
  $scope.removePost = function(index){
    $scope.user.posts.splice(index, 1);
    $scope.refreshFeeds();
  }

  $scope.removeAlbum = function(index){
    $scope.user.albums.splice(index, 1);
    $scope.refreshFeeds();
  }

  var f = new File([""], "");
  $scope.post = {attachment : f , text: ''};
  $scope.publishPost = function(){
    var fd = new FormData();
    fd.append('attachment', $scope.post.attachment);
    fd.append('text' , $scope.post.text );
    fd.append('user' , $scope.me.url);
    var uploadUrl = "/api/social/post/";
    $http({method : 'POST' , url : uploadUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.user.posts.push(response.data);
      $scope.refreshFeeds();
      $scope.post.attachment = emptyFile;
      $scope.post.text = '';
      Flash.create('success', response.status + ' : ' + response.statusText );

    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  };
  $scope.uploadImage = function(){
    var fd = new FormData();
    fd.append('photo', $scope.picturePost.photo);
    fd.append('tagged' , '');
    fd.append('user' , $scope.me.url);
    var uploadUrl = "/api/social/picture/";
    $http({method : 'POST' , url : uploadUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.user.pictures.push(response.data);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  };
  $scope.saveSocial = function(){

    var fd = new FormData();
    fd.append('status', $scope.user.socialData.status);
    if ($scope.user.socialData.coverPicFile != emptyFile) {
      fd.append('coverPic', $scope.user.socialData.coverPicFile);
    }
    fd.append('aboutMe' , $scope.user.socialData.aboutMe);
    var uploadUrl = $scope.user.social;
    $http({method : 'PATCH' , url : uploadUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText );
      $scope.user.socialData.coverPic = response.data.coverPic;
      $scope.user.socialData.coverPicFile = emptyFile;
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    });
  };
});

app.controller('socialController', function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , $state) {
  $scope.user = userProfileService.get('mySelf').url.split('users/')[0]+'users/'+$state.params.id+'/';
  if ($state.params.id == '') {
    $scope.user = userProfileService.get('mySelf').url;
  }
});
