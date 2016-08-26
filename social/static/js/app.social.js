app.directive('commentBubble', function() {
  return {
    templateUrl: '/static/ngTemplates/commentBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
      configObj: '=',
    },
    controller: function($scope, $http, $users) {
      // configObj = {commentUrl : '/api/PIM/blogComment/' , likeUrl : '/api/PIM/blogCommentLike/' }

      $scope.me = $users.get("mySelf");
      $scope.liked = false;
      for (var i = 0; i < $scope.data.likes.length; i++) {
        if ($scope.data.likes[i].user == $scope.me.pk) {
          $scope.liked = true;
          break;
        }
      }
      if ($scope.data.user == $scope.me.pk) {
        $scope.iCommented = true;
      } else {
        $scope.iCommented = false;
      }
      $scope.like = function() {
        if ($scope.liked) {
          for (var i = 0; i < $scope.data.likes.length; i++) {
            if ($scope.data.likes[i].user == $scope.me.pk) {
              index = i;
              // console.log($scope.data.likes[i]);
              console.log($scope.data.pk);
              $http({
                method: 'DELETE',
                url: $scope.configObj.likeUrl + $scope.data.likes[i].pk + '/'
              }).
              then(function(response, index) {
                $scope.data.likes.splice(index, 1);
                $scope.liked = false;
              });
            }
          }
        } else {
          dataToSend = {
            parent: $scope.data.pk,
            user: $scope.me.pk
          };
          // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
          $http({
            method: 'PATCH',
            url: $scope.configObj.commentUrl + $scope.data.pk + '/'
          }).
          then(function(response) {
            // console.log(response);
            for (var i = 0; i < response.data.likes.length; i++) {
              if (response.data.likes[i].user == $scope.me.pk) {
                $scope.data.likes.push(response.data.likes[i])
              }
            }
            $scope.liked = true;
          }, function(response) {

          });
        }
      }
      $scope.delete = function() {
        console.log($scope.data.pk);
        $http({
          method: 'DELETE',
          url: $scope.configObj.commentUrl + $scope.data.pk + '/'
        }).
        then(function(response) {
          $scope.onDelete();

        }, function(response) {

        });
      }
    },
  };
});

app.directive('post', function() {
  return {
    templateUrl: '/static/ngTemplates/postBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {
      $scope.openPost = function(position, backdrop, input) {
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
          controller: 'controller.social.aside.post',
          resolve: {
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});

app.controller('controller.social.aside.post', function($scope, $uibModalInstance, $http, $users, input) {
  $scope.content = 'post';

  $scope.postCommentConfig = {
    commentUrl: '/api/social/postComment/',
    likeUrl: '/api/social/commentLike/'
  }

  $scope.me = $users.get("mySelf");
  $scope.data = input.data;
  $scope.onDelete = input.onDelete;

  if (typeof $scope.data.url == 'undefined' && typeof $scope.data.pk == 'undefined') {
    return;
  }
  console.log($scope.data);
  var postUrl = '/api/social/post/' + $scope.data.pk
  $scope.url = postUrl;
  if ($scope.onDelete.length != 0) { // if the post aside is initiated by the notification system then the refreshed data is already fetched by it
    // and passed into input as data but if we are opening it from the feeds list then getting the latest post object
    if (postUrl.indexOf('?') == -1) {
      postUrl += '?';
    }
    postUrl += '&user=' + $users.get($scope.data.user).username;
    $http({
      method: 'GET',
      url: postUrl
    }).
    then(function(requests) {
      for (key in requests.data) {
        $scope.data[key] = requests.data[key];
      }
    });
  }
  setTimeout(function() {
    scroll("#commentsArea");
  }, 100);
  $scope.possibleCommentHeight = 70; // initial height percent setting
  $scope.textToComment = "";

  var tagged = [];
  console.log($scope.data);
  for (var i = 0; i < $scope.data.tagged.length; i++) {
    tagged.push({
      username: $users.get($scope.data.tagged[i]).username
    })
  }
  $scope.postEditor = {
    attachment: emptyFile,
    tagged: tagged
  }
  $scope.viewMode = 'comments';
  $scope.liked = false;
  if (typeof $scope.data == 'undefined') {
    return;
  }
  for (var i = 0; i < $scope.data.likes.length; i++) {
    if ($scope.data.likes[i].user == $scope.me.pk) {
      $scope.liked = true;
      break;
    }
  }
  if ($scope.data.user == $scope.me.pk) {
    $scope.isOwner = true;
  } else {
    $scope.isOwner = false;
  }
  setTimeout(function() {
    var postBodyHeight = $("#postModalBody").height();
    var sinputHeight = $("#commentInput").height();
    var winHeight = $(window).height();
    var defaultHeight = postBodyHeight + 5.7 * inputHeight;
    $scope.commentsHeight = Math.floor(100 * (winHeight - defaultHeight) / winHeight);
    $scope.$apply();
    scroll("#commentsArea");
  }, 100);

  $scope.refreshAside = function(signal) {

    var nodeUrl = '/api/social/';
    if (signal.action == 'created') {
      if (typeof signal.parent == 'number') {
        var updateType = signal.type.split('.')[1];

        if (updateType == 'commentLike') {
          var pk = signal.parent;
          var url = nodeUrl + $scope.content + 'Comment';
        } else {
          var pk = signal.id;
          var url = nodeUrl + updateType;
        }
        $http({
          method: 'GET',
          url: url + '/' + pk + '/'
        }).
        then(function(response) {
          if (response.data.parent == $scope.data.pk) {
            if (updateType == $scope.content + 'Like') {
              $scope.data.likes.push(response.data);
              if (response.data.user == $scope.me.url) {
                $scope.liked = true;
              }
            } else if (updateType == $scope.content + 'Comment') {
              $scope.data.comments.push(response.data);
            } else if (updateType == 'commentLike') {
              $http({
                method: 'GET',
                url: nodeUrl + updateType + '/' + signal.id + '/'
              }).
              then(function(response) {
                for (var i = 0; i < $scope.data.comments.length; i++) {
                  if ($scope.data.comments[i].pk == pk) {
                    $scope.data.comments[i].likes.push(response.data);
                  }
                }
              })
            }
          }
        });
      } else {
        $http({
          method: 'GET',
          url: '/api/PIM/notification/' + signal.id + '/'
        }).
        then(function(response) {
          var parts = response.data.shortInfo.split(':');
          var updateType = parts[0];
          if (updateType == $scope.content + 'Like') {
            $http({
              method: 'GET',
              url: '/api/social/' + $scope.content + 'Like/' + parts[1] + '/'
            }).
            then(function(response) {
              if (response.data.parent == $scope.data.url.cleanUrl()) {
                $scope.data.likes.push(response.data);
                if (response.data.user == $scope.me.url) {
                  $scope.liked = true;
                }
              }
            });
          } else if (updateType == $scope.content + 'Comment') {
            $http({
              method: 'GET',
              url: '/api/social/' + $scope.content + 'Comment/' + parts[1] + '/'
            }).
            then(function(response) {
              if (response.data.parent == $scope.data.url.cleanUrl()) {
                $scope.data.comments.push(response.data);
              }
            });
          };
        });
      }
    } else if (signal.action == 'deleted') {
      if (typeof signal.parent == 'number') {
        var id = signal.id;

      } else {
        var id = signal.objID;
      }
      var updateType = signal.type.split('.')[1];
      if (updateType == $scope.content + 'Comment') {

        for (var i = 0; i < $scope.data.comments.length; i++) {
          if ($scope.data.comments[i].pk == id) {
            $scope.data.comments.splice(i, 1);
          }
        }
      } else if (updateType == $scope.content + 'Like') {

        for (var i = 0; i < $scope.data.likes.length; i++) {
          if ($scope.data.likes[i].url.indexOf(nodeUrl + updateType + '/' + id) != -1) {
            $scope.data.likes.splice(i, 1);
            for (var i = 0; i < $scope.data.likes.length; i++) {
              if ($scope.data.likes[i].user.cleanUrl() == $scope.me.url) {
                $scope.liked = true;
                break;
              }
            }
          }
        };
      } else if (updateType == 'commentLike') {
        for (var i = 0; i < $scope.data.comments.length; i++) {
          for (var j = 0; j < $scope.data.comments[i].likes.length; j++) {
            // console.log(nodeUrl + updateType + '/' + signal.id);
            if ($scope.data.comments[i].likes[j].pk == signal.id) {
              $scope.data.comments[i].likes.splice(j, 1);
            }
          }
        }
      }
    } // if - else
    setTimeout(function() {
      scroll("#commentsArea");
    }, 1000);
  };
  console.log($scope.data);
  $scope.comment = function() {
    console.log($scope);
    if ($scope.textToComment == "") {
      return;
    }
    dataToSend = {
      text: $scope.textToComment,
      parent: $scope.data.pk,
      user: $scope.data.user
    };
    // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
    $http({
      method: 'POST',
      data: dataToSend,
      url: '/api/social/postComment/'
    }).
    then(function(response) {
      $scope.data.comments.push(response.data)
      $scope.textToComment = "";
      $scope.viewMode = 'comments';
      setTimeout(function() {
        scroll("#commentsArea");
      }, 100);
    }, function(response) {
      // console.log("failed to sent the comment");
    });
  }
  $scope.deleteComment = function(index) {
    $scope.data.comments.splice(index, 1);
  }

  $scope.like = function() {
    if ($scope.liked) {
      $http({
        method: 'DELETE',
        url: '/api/social/postLike/' + $scope.data.likes[i].pk
      }).
      then(function(response) {
        for (var i = 0; i < $scope.data.likes.length; i++) {
          if ($scope.data.likes[i].user == $scope.me.pk) {
            $scope.data.likes.splice(i, 1);
            $scope.liked = false;
          }
        }
      }, function(response) {
        // console.log("failed to sent the comment");
      });

    } else {
      dataToSend = {
        parent: $scope.data.pk,
        user: $scope.data.user
      };
      // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
      $http({
        method: 'POST',
        data: dataToSend,
        url: '/api/social/postLike/'
      }).
      then(function(response) {
        $scope.liked = true;
        $scope.data.likes.push(response.data)
      }, function(response) {
        // console.log("failed to sent the comment");
      });
    }
  }


  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };

  $scope.enableEdit = function() {
    $scope.editMode = true;
    $scope.backupText = angular.copy($scope.data.text);
  }
  $scope.save = function() {
    var fd = new FormData();
    fd.append('text', $scope.data.text);
    fd.append('user', $scope.me.pk);
    if ($scope.postEditor.attachment != emptyFile) {
      fd.append('attachment', $scope.postEditor.attachment);
    }
    if (typeof $scope.postEditor.tagged != 'undefined' && $scope.postEditor.tagged.length != 0) {
      tagStr = '';
      for (var i = 0; i < $scope.postEditor.tagged.length; i++) {
        tagStr += $scope.postEditor.tagged[i].username;
        if (i != $scope.postEditor.tagged.length - 1) {
          tagStr += ','
        }
      }
      fd.append('tagged', tagStr)
    }

    var url = '/api/social/post/' + $scope.data.pk + '/';
    $http({
      method: 'PATCH',
      url: url,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.editMode = false;
      for (key in response.data) {
        $scope.data[key] = response.data[key];
      }
    });
  }
  $scope.cancelEditor = function() {
    $scope.data.text = $scope.backupText;
    $scope.editMode = false;
  }

  $scope.delete = function() {
    $http({
      method: 'DELETE',
      url: '/api/social/post/' + $scope.data.pk + '/'
    }).
    then(function(response) {
      $scope.onDelete();
      $uibModalInstance.close();
    });
  }
});

app.directive('album', function() {
  return {
    template: '<li>' +
      '<i class="fa fa-camera bg-aqua"></i>' +
        '<div class="timeline-item">' +
          '<span class="time"><i class="fa fa-clock-o"></i> {{data.created | timeAgo}} ago</span>' +
          '<h3 class="timeline-header"><a href="#">{{data.user | getName}}</a> uploaded new photos to album : {{data.title}}</h3>' +
          '<div class="timeline-body">' +
            '<div ng-repeat = "picture in data.photos" style="display: inline;">' +
              '<img ng-click="openAlbum(' + "'right'" + ', true , {data : picture , parent : data , onDelete : albumDelete})" ng-src="{{picture.photo}}" alt="..." class="margin" height="100px" width="150px" >' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</li>',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      albumDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {
      $scope.openAlbum = function(position, backdrop, input) {
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
            input: function() {
              return input;
            }
          }
        }).result.then(postClose, postClose);
      }
    },
  };
});

app.controller('controller.social.aside.picture', function($scope, $uibModalInstance, Flash, $http, $users, input) {
  $scope.postCommentConfig = {
    commentUrl: '/api/social/pictureComment/',
    likeUrl: '/api/social/commentLike/'
  }

  $scope.content = 'picture';
  $scope.me = $users.get("mySelf");
  $scope.data = input.data;
  $scope.parent = input.parent;
  $scope.albumDelete = input.onDelete;
  console.log($scope.data);
  if (typeof $scope.data.url == 'undefined') {
    $scope.data.url = '/api/social/picture/' + $scope.data.pk + '/';
  }
  if ($scope.data.url.indexOf('?') == -1) {
    $scope.data.url += '?';
  }
  $http({
    method: 'GET',
    url: $scope.data.url + '&user=' + $users.get($scope.data.user).username
  }).
  then(function(requests) {
    for (key in requests.data) {
      $scope.data[key] = requests.data[key];
    }
    setTimeout(function() {
      scroll("#commentsArea");
    }, 100);
  });


  $http({
    method: 'GET',
    url: '/api/social/album/' + $scope.parent.pk + '/?user=' + $users.get($scope.data.user).username
  }).
  then(function(requests) {
    for (key in requests.data) {
      $scope.parent[key] = requests.data[key];
    }
  });

  var views = [{
    name: 'drag',
    icon: '',
    template: '/static/ngTemplates/app.social.draggablePhoto.html'
  }];
  var getParams = [{
    key: 'albumEditor',
    value: ''
  }, {
    key: 'user',
    value: $scope.me.username
  }];

  $scope.config = {
    url: '/api/social/picture/',
    views: views,
    getParams: getParams,
  };

  $scope.droppedObjects = angular.copy($scope.parent.photos);
  tagged = [];
  for (var i = 0; i < $scope.parent.tagged.length; i++) {
    tagged.push({
      username: $users.get($scope.parent.tagged[i]).username
    })
  }
  $scope.tempAlbum = {
    title: $scope.parent.title,
    photos: [],
    tagged: tagged
  };
  $scope.editorData = {
    draggableObjects: []
  };
  $scope.editMode = false;
  $scope.possibleCommentHeight = 70;
  $scope.toComment = {
    textToComment: ''
  };
  $scope.viewMode = 'comments';
  $scope.liked = false;
  for (var i = 0; i < $scope.data.likes.length; i++) {
    if ($scope.data.likes[i].user == $scope.me.pk) {
      $scope.liked = true;
      break;
    }
  }
  if ($scope.data.user == $scope.me.pk && $scope.parent != 'empty') {
    $scope.isOwner = true;
  } else {
    $scope.isOwner = false;
  }
  setTimeout(function() {
    postBodyHeight = $("#postModalBody").height();
    inputHeight = $("#commentInput").height();
    winHeight = $(window).height();
    defaultHeight = postBodyHeight + 6 * inputHeight;
    $scope.commentsHeight = Math.floor(100 * (winHeight - defaultHeight) / winHeight);
    $scope.$apply();
    scroll("#commentsArea");
  }, 100);

  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };

  $scope.comment = function() {
    if ($scope.toComment.textToComment == 's') {
      return;
    }
    dataToSend = {
      text: $scope.toComment.textToComment,
      parent: $scope.data.pk,
      user: $scope.data.user
    };
    // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
    $http({
      method: 'POST',
      data: dataToSend,
      url: '/api/social/pictureComment/'
    }).
    then(function(response) {
      $scope.toComment.textToComment = "";
      $scope.data.comments.push(response.data)
      $scope.viewMode = 'comments';
      setTimeout(function() {
        scroll("#commentsArea");
      }, 100);
    }, function(response) {
      // console.log("failed to sent the comment");

    });
  }
  $scope.deletePhoto = function() {
    $http({
      method: 'DELETE',
      url: '/api/social/picture/'+$scope.data.pk+'/'
    }).
    then(function(response) {
      for (var i = 0; i < $scope.parent.photos.length; i++) {
        if ($scope.parent.photos[i].pk == $scope.data.pk) {
          $scope.parent.photos.splice(i, 1);
          if (i == 0 && $scope.parent.photos.length == 0) {
            $scope.deleteAlbum()
          } else {
            if ($scope.parent.photos.length <= i + 1) {
              $scope.data = $scope.parent.photos[i - 1];
            } else {
              $scope.data = $scope.parent.photos[i];
            }
          }
        }
      }
    }, function(response) {

    });
  }
  $scope.edit = function() {
    $scope.editMode = true;
  }
  $scope.cancelEditor = function() {
    $scope.editMode = false;
  }
  $scope.deleteAlbum = function() {
    $http({
      method: 'DELETE',
      url: '/api/social/album/'+$scope.parent.pk+'/'
    }).
    then(function(response) {
      $scope.albumDelete();
      // calling the album Delete function passed with the open Album Aside function to refresh the feeds
      $uibModalInstance.close();
    }, function(response) {

    });
  }
  $scope.deleteComment = function(index) {
    $scope.data.comments.splice(index, 1);
  }
  $scope.removeFromTempAlbum = function(index) {
    pic = $scope.droppedObjects[index];
    $scope.droppedObjects.splice(index, 1);
    $scope.editorData.draggableObjects.push(pic);
  }
  $scope.updateAlbum = function() {
    if ($scope.droppedObjects.length == 0) {
      Flash.create('danger', 'No photos in the album');
      return;
    }
    for (var i = 0; i < $scope.droppedObjects.length; i++) {
      console.log($scope.droppedObjects);
      // nested request is not supported by the django rest framework so sending the PKs of the photos to the create function in the serializer
      $scope.tempAlbum.photos.push($scope.droppedObjects[i].pk);
    }
    dataToPost = {
      user: $scope.me.pk,
      title: $scope.tempAlbum.title,
      photos: $scope.tempAlbum.photos,
    };

    if (typeof $scope.tempAlbum.tagged != 'undefined' && $scope.tempAlbum.tagged.length != 0) {
      tagStr = '';
      for (var i = 0; i < $scope.tempAlbum.tagged.length; i++) {
        tagStr += $scope.tempAlbum.tagged[i].username;
        if (i != $scope.tempAlbum.tagged.length - 1) {
          tagStr += ','
        }
      }
      dataToPost.tagged = tagStr
    }

    console.log($scope.parent);
    $http({
      method: 'PATCH',
      data: dataToPost,
      url: '/api/social/album/' + $scope.parent.pk + '/'
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.parent.title = response.data.title;
      $scope.parent.photos = response.data.photos;
      $scope.parent.tagged = response.data.tagged;
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }
  $scope.onDropComplete = function(data, evt) {
    var index = $scope.droppedObjects.indexOf(data);
    if (index == -1) {
      $scope.droppedObjects.push(data);
      var index = $scope.editorData.draggableObjects.indexOf(data);
      $scope.editorData.draggableObjects.splice(index, 1);
    }
  }
  $scope.like = function() {
    if ($scope.liked) {
      for (var i = 0; i < $scope.data.likes.length; i++) {
        if ($scope.data.likes[i].user == $scope.me.pk) {
          index = i;
          $http({
            method: 'DELETE',
            url: '/api/social/pictureLike/' + $scope.data.likes[i].pk + '/'
          }).
          then(function(response, index) {
            $scope.data.likes.splice(index, 1);
            $scope.liked = false;
          }, function(response) {
            // console.log("failed to sent the comment");
          });
        }
      }
    } else {
      dataToSend = {
        parent: $scope.data.pk,
        user: $scope.data.user
      };
      // although the api will set the user to the sender of the request a valid user url is needed for the request otherwise 400 error will be trown
      $http({
        method: 'POST',
        data: dataToSend,
        url: '/api/social/pictureLike/'
      }).
      then(function(response) {
        $scope.liked = true;
        $scope.data.likes.push(response.data)
      }, function(response) {
        // console.log("failed to sent the comment");
      });
    }
  }
  $scope.refreshAside = function(signal) {

    var nodeUrl = '/api/social/';
    if (signal.action == 'created') {
      if (typeof signal.parent == 'number') {
        updateType = signal.type.split('.')[1];

        if (updateType == 'commentLike') {
          pk = signal.parent;
          url = nodeUrl + $scope.content + 'Comment';
        } else {
          pk = signal.id;
          url = nodeUrl + updateType;
        }
        $http({
          method: 'GET',
          url: url + '/' + pk + '/'
        }).
        then(function(response) {
          if (response.data.parent == $scope.data.url.cleanUrl()) {
            if (updateType == $scope.content + 'Like') {
              $scope.data.likes.push(response.data);
              if (response.data.user == $scope.me.url) {
                $scope.liked = true;
              }
            } else if (updateType == $scope.content + 'Comment') {
              $scope.data.comments.push(response.data);
            } else if (updateType == 'commentLike') {
              $http({
                method: 'GET',
                url: nodeUrl + updateType + '/' + signal.id + '/'
              }).
              then(function(response) {
                for (var i = 0; i < $scope.data.comments.length; i++) {
                  if ($scope.data.comments[i].url.indexOf(url + '/' + pk + '/') != -1) {
                    $scope.data.comments[i].likes.push(response.data);
                  }
                }
              })
            }
          }
        });
      } else {
        $http({
          method: 'GET',
          url: '/api/PIM/notification/' + signal.id + '/'
        }).
        then(function(response) {
          parts = response.data.shortInfo.split(':');
          updateType = parts[0];
          if (updateType == $scope.content + 'Like') {
            $http({
              method: 'GET',
              url: '/api/social/' + $scope.content + 'Like/' + parts[1] + '/'
            }).
            then(function(response) {
              if (response.data.parent == $scope.data.url.cleanUrl()) {
                $scope.data.likes.push(response.data);
                if (response.data.user == $scope.me.url) {
                  $scope.liked = true;
                }
              }
            });
          } else if (updateType == $scope.content + 'Comment') {
            $http({
              method: 'GET',
              url: '/api/social/' + $scope.content + 'Comment/' + parts[1] + '/'
            }).
            then(function(response) {
              if (response.data.parent == $scope.data.url.cleanUrl()) {
                $scope.data.comments.push(response.data);
              }
            });
          };
        });
      }
    } else if (signal.action == 'deleted') {
      if (typeof signal.parent == 'number') {
        id = signal.id;

      } else {
        id = signal.objID;
      }
      updateType = signal.type.split('.')[1];
      if (updateType == $scope.content + 'Comment') {
        console.log($scope.data.comments);
        for (var i = 0; i < $scope.data.comments.length; i++) {
          if ($scope.data.comments[i].pk == id) {
            $scope.data.comments.splice(i, 1);
          }
        }
      } else if (updateType == $scope.content + 'Like') {

        for (var i = 0; i < $scope.data.likes.length; i++) {
          if ($scope.data.likes[i].url.indexOf(nodeUrl + updateType + '/' + id) != -1) {
            $scope.data.likes.splice(i, 1);
            for (var i = 0; i < $scope.data.likes.length; i++) {
              if ($scope.data.likes[i].user.cleanUrl() == $scope.me.url) {
                $scope.liked = true;
                break;
              }
            }
          }
        };
      } else if (updateType == 'commentLike') {
        for (var i = 0; i < $scope.data.comments.length; i++) {
          for (var j = 0; j < $scope.data.comments[i].likes.length; j++) {
            // console.log(nodeUrl + updateType + '/' + signal.id);
            if ($scope.data.comments[i].likes[j].url.indexOf(nodeUrl + updateType + '/' + signal.id) != -1) {
              $scope.data.comments[i].likes.splice(j, 1);
            }
          }
        }
      }
    } // if - else
    setTimeout(function() {
      scroll("#commentsArea");
    }, 1000);
  };
});

app.directive('socialProfile', function() {
  return {
    templateUrl: '/static/ngTemplates/app.social.profile.html',
    restrict: 'E',
    replace: false,
    scope: {
      userUrl: '=',
    },
    controller: 'controller.social.profile',
  };
});

app.controller('controller.social.profile', function($scope, $state, $http, $timeout, $users, $aside, $interval, $window, Flash) {
  emptyFile = new File([""], "");
  $scope.me = $users.get('mySelf')
  $scope.username = $users.get($scope.userUrl).username;

  $scope.getDesignationAndSocial = function() {
    $http({
      method: 'GET',
      url: '/api/social/social/' + $scope.user.social + '/'
    }).then(
      function(response) {
        $scope.user.socialData = response.data;
        $scope.user.socialData.coverPicFile = emptyFile;
        for (var i = 0; i < response.data.followers.length; i++) {
          if (response.data.followers[i] == $scope.me.pk) {
            $scope.isFollowing = true;
          }
        }
      }
    )
    $http({
      method: 'GET',
      url: '/api/HR/designation/' + $scope.user.designation + '/'
    }).then(
      function(response) {
        $scope.user.designationData = response.data;
      }
    )
  };
  $http({
    method: 'GET',
    url: $scope.userUrl
  }).
  then(function(response) {
      $scope.user = response.data;
      var feedsItems = ['picture'];
      for (var i = 0; i < feedsItems.length; i++) {
        mode = feedsItems[i];
        $http({
          method: 'GET',
          url: '/api/social/' + mode + '/?format=json&user=' + $scope.username
        }).
        then(function(response) {
          $scope.user.pictures = response.data;
          $scope.getDesignationAndSocial()
        });
      };
    })
    // console.log($scope.me);

  $scope.offset = {
    post: 0,
    album: 0
  };
  $scope.max = {
    post: 0,
    album: 0
  };
  $scope.limit = 5;
  $scope.socialResource = {
    posts: [],
    albums: []
  };
  // to get the next or prev five social content in mode = post or album based on the currect value of offset[key] and the limit


  $scope.getFiveStatus = 0;
  $scope.feedStart = 0;

  $scope.$watch('getFiveStatus', function(newValue, oldValue) {
    if (newValue == 2) {
      $scope.sortResource();
      $scope.refreshFeeds();
    }
  });

  $scope.droppedObjects = [];
  $scope.editorData = {
    draggableObjects: []
  }; // for the album editor
  $scope.statusMessage = '';
  $scope.picturePost = {
    photo: {},
    tagged: ''
  };
  $scope.isFollowing = false; // for storing if the user is following the the user whose profile he is visiting
  if ($scope.username == $scope.me.username) {
    $scope.myProfile = true;
  } else {
    $scope.myProfile = false;
  }



  $http({
    method: 'GET',
    url: '/api/PIM/blog/?user=' + $scope.username
  }).then(
    function(response) {
      $scope.socialResource.whatsNew = response.data;
    }
  )

  $scope.readWhatsNew = function(index) {
    $state.go('home.blog', {
      id: $scope.socialResource.whatsNew[index].pk,
      action: 'read'
    })
  }


  var views = [{
    name: 'drag',
    icon: '',
    template: '/static/ngTemplates/app.social.draggablePhoto.html'
  }]; // to be used in the album editor
  var getParams = [{
    key: 'albumEditor',
    value: ''
  }, {
    key: 'user',
    value: $scope.username
  }];
  $scope.tempAlbum = {
    title: '',
    photos: [],
    tagged: ''
  };

  $scope.config = {
    url: '/api/social/picture/',
    views: views,
    getParams: getParams,
  };


  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };

  $scope.openChat = function() {
    $scope.$parent.$parent.$parent.addIMWindow($scope.user.pk);
  };

  $scope.follow = function() {
    if ($scope.isFollowing) {
      dataToSend = {
        friend: $scope.username,
        mode: 'unfollow'
      }
      $http({
        method: 'PATCH',
        url: '/api/social/social/' + $scope.me.social + '/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.isFollowing = false;
        for (var i = 0; i < $scope.user.socialData.followers.length; i++) {
          if ($scope.user.socialData.followers[i] == $scope.me.pk) {
            $scope.user.socialData.followers.splice(i, 1);
          }
        }
      })
    } else {
      dataToSend = {
        friend: $scope.username,
        mode: 'follow'
      }
      $http({
        method: 'PATCH',
        url: '/api/social/social/' + $scope.me.social + '/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.isFollowing = true;
        $scope.user.socialData.followers.push($scope.me.url);
      });
    }
  };

  $scope.getFive = function(mode) {
    // mode is the content type, like posts, albums etc
    $http({
      method: 'GET',
      url: '/api/social/' + mode + '/?format=json&user=' + $scope.username + '&offset=' + $scope.offset[mode] + '&limit=' + $scope.limit
    }).
    then(function(response) {
      $scope.max['post'] = response.data.count;
      if (response.config.url.indexOf('album') != -1) {
        for (var i = 0; i < response.data.results.length; i++) {
          $scope.socialResource.albums.push(response.data.results[i])
        }
        $scope.getFiveStatus += 1;
        $scope.offset['album'] += $scope.limit;
      } else if (response.config.url.indexOf('post') != -1) {
        for (var i = 0; i < response.data.results.length; i++) {
          $scope.socialResource.posts.push(response.data.results[i])
            // console.log(response.data.results[i].text);
        }
        $scope.getFiveStatus += 1;
        $scope.offset['post'] += $scope.limit;
      };
    });
  };

  $scope.getFive('post');
  $scope.getFive('album');

  $scope.sortResource = function() {
    // console.log("now sorting the rawResourceFeeds");
    orderMat = [];
    // console.log( $scope.socialResource.albums);
    for (var i = 0; i < $scope.socialResource.albums.length; i++) {
      orderMat.push({
        created: $scope.socialResource.albums[i].created,
        type: 'album',
        index: i
      })
    }
    // console.log($scope.socialResource.posts);
    for (var i = 0; i < $scope.socialResource.posts.length; i++) {
      orderMat.push({
        created: $scope.socialResource.posts[i].created,
        type: 'post',
        index: i
      })
    }
    $scope.rawResourceFeeds = angular.copy(orderMat);
    orderMat.sortIndices(function(b, a) {
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
    // console.log(orderMat);
    $scope.sortedResourceFeeds = [];
    for (var i = 0; i < orderMat.length; i++) {
      $scope.sortedResourceFeeds.push($scope.rawResourceFeeds[orderMat[i]])
    }
    // console.log($scope.sortedResourceFeeds);
  }
  $scope.refreshFeeds = function() {
    // console.log("now refreshing the post");
    $scope.sortedFeeds = [];
    for (var i = 0; i < 5; i++) {
      if ($scope.feedStart + i > $scope.sortedResourceFeeds.length) {
        break;
      }
      $scope.sortedFeeds.push($scope.sortedResourceFeeds[$scope.feedStart + i]);
    }
    // console.log($scope.sortedFeeds);
  }
  $scope.removePost = function(index) {
    // console.log("removed post");
    $scope.socialResource.posts.splice(index, 1);
    $scope.sortResource();
    $scope.refreshFeeds();
  }
  $scope.removeAlbum = function(index) {
    // console.log("removed album");
    $scope.socialResource.albums.splice(index, 1);
    $scope.sortResource();
    $scope.refreshFeeds();
  }
  $scope.prev = function() {
    $scope.feedStart -= 5;
    if ($scope.feedStart < 0) {
      $scope.feedStart = 0;
    }
    $scope.sortResource();
    $scope.refreshFeeds();
  };
  $scope.next = function() {
    // console.log("next clicked");
    $scope.getFiveStatus = 0;
    $scope.getFive('post');
    $scope.getFive('album');
    $scope.feedStart += 5;
    if ($scope.feedStart > $scope.sortedResourceFeeds.length) {
      $scope.feedStart -= 5;
    }
  }
  $scope.removeFromTempAlbum = function(index) {
    pic = $scope.droppedObjects[index];
    $scope.droppedObjects.splice(index, 1);
    $scope.editorData.draggableObjects.push(pic);
  }
  $scope.createAlbum = function() {
    if ($scope.droppedObjects.length == 0) {
      Flash.create('danger', 'No photos in the album');
      return;
    }
    for (var i = 0; i < $scope.droppedObjects.length; i++) {
      // nested request is not supported by the django rest framework so sending the PKs of the photos to the create function in the serializer
      $scope.tempAlbum.photos.push($scope.droppedObjects[i].pk);
    }
    dataToPost = {
      user: $scope.me.pk,
      title: $scope.tempAlbum.title,
      photos: $scope.tempAlbum.photos,
    };

    if (typeof $scope.tempAlbum.tagged != 'undefined' && $scope.tempAlbum.tagged.length != 0) {
      tagStr = '';
      for (var i = 0; i < $scope.tempAlbum.tagged.length; i++) {
        tagStr += $scope.tempAlbum.tagged[i].username;
        if (i != $scope.tempAlbum.tagged.length - 1) {
          tagStr += ','
        }
      }
      dataToPost.tagged = tagStr
    }

    // console.log(dataToPost);
    $http({
      method: 'POST',
      data: dataToPost,
      url: '/api/social/album/'
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.tempAlbum.title = '';
      $scope.tempAlbum.tagged = '';
      $scope.tempAlbum.photos = [];
      $scope.droppedObjects = [];
      $scope.socialResource.albums.push(response.data);
      $scope.sortResource();
      $scope.refreshFeeds();
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }
  $scope.onDropComplete = function(data, evt) {
    var index = $scope.droppedObjects.indexOf(data);
    if (index == -1) {
      $scope.droppedObjects.push(data);
      var index = $scope.editorData.draggableObjects.indexOf(data);
      $scope.editorData.draggableObjects.splice(index, 1);
    }
  }


  var f = new File([""], "");
  $scope.post = {
    attachment: f,
    text: ''
  };
  $scope.publishPost = function() {
    var fd = new FormData();
    fd.append('attachment', $scope.post.attachment);
    fd.append('text', $scope.post.text);
    fd.append('user', $scope.me.pk);

    if (typeof $scope.post.tagged != 'undefined' && $scope.post.tagged.length != 0) {
      tagStr = '';
      for (var i = 0; i < $scope.post.tagged.length; i++) {
        tagStr += $scope.post.tagged[i].username;
        if (i != $scope.post.tagged.length - 1) {
          tagStr += ','
        }
      }
      fd.append('tagged', tagStr)
    }

    var uploadUrl = "/api/social/post/";
    $http({
      method: 'POST',
      url: uploadUrl,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.socialResource.posts.push(response.data);
      $scope.sortResource();
      $scope.refreshFeeds();
      $scope.post.attachment = emptyFile;
      $scope.post.text = '';
      $scope.post.tagged = '';
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };
  $scope.uploadImage = function() {
    var fd = new FormData();
    fd.append('photo', $scope.picturePost.photo);
    if (typeof $scope.picturePost.tagged != 'undefined' && $scope.picturePost.tagged.length != 0) {
      withStr = '';
      for (var i = 0; i < $scope.picturePost.tagged.length; i++) {
        withStr += $scope.picturePost.tagged[i].username;
        if (i != $scope.picturePost.tagged.length - 1) {
          withStr += ','
        }
      }
      fd.append('tagged', withStr)
    }
    fd.append('user', $scope.me.pk);
    var uploadUrl = "/api/social/picture/";
    $http({
      method: 'POST',
      url: uploadUrl,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.user.pictures.push(response.data);
      $scope.picturePost.photo = emptyFile;
      $scope.picturePost.tagged = '';

    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };
  $scope.saveSocial = function() {
    var fd = new FormData();
    fd.append('status', $scope.user.socialData.status);
    if ($scope.user.socialData.coverPicFile != emptyFile) {
      fd.append('coverPic', $scope.user.socialData.coverPicFile);
    }
    fd.append('aboutMe', $scope.user.socialData.aboutMe);
    var uploadUrl = '/api/social/social/' + $scope.user.social + '/';
    $http({
      method: 'PATCH',
      url: uploadUrl,
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.user.socialData.coverPic = response.data.coverPic;
      $scope.user.socialData.coverPicFile = emptyFile;
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };
});

app.controller('controller.social', function($scope, $http, $timeout, $users, $aside, $interval, $window, $state) {
  $scope.user = '/api/HR/users/' + $state.params.id + '/';
  if ($state.params.id == '') {
    $scope.user = $users.get('mySelf').url;
  }
});
