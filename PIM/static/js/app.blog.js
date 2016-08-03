app.controller("controller.home.blog", function($scope , $state , $users ,  $stateParams , $http , Flash) {
  $scope.me = $users.get('mySelf');
  $scope.editor = {source : '' , tags : [] , title : '' , header : '' , mode : 'header'};
  $scope.filter = {text : '' , tags :[] , month : new Date() , state : 'published' , user : 'all'};
  $scope.itemsPerPage = 5;
  $scope.pageNo = 0;
  $scope.disableNext = false;
  $scope.liked = false;
  $scope.recommended = [];

  $scope.configObj = {commentUrl : '/api/PIM/blogComment/' , likeUrl : '/api/PIM/blogCommentLike/' }


  $scope.search = function(){
    tags = '';
    if ($scope.filter.tags.length !=0) {
      for (var i = 0; i < $scope.filter.tags.length; i++) {
        tags += $scope.filter.tags[i].pk;
        if (i != $scope.filter.tags.length-1) {
          tags += ',';
        }
      }
    }
    url = '/api/PIM/blog/?title__contains='+$scope.filter.text + '&state=' + $scope.filter.state + '&limit=' + $scope.itemsPerPage + '&offset=' + $scope.pageNo*$scope.itemsPerPage;
    if (tags !=''){
      url += '&tags=' + tags;
    }
    if ($scope.filter.user != 'all') {
      url += '&user=' + $scope.filter.user;
    }
    $http({method : 'GET' , url : url , data : {month : $scope.filter.month}}).
    then(function(response){
      $scope.blogs = response.data.results;
      if ($scope.pageNo > 0 && response.data.results.length == 0) {
        $scope.pageNo -= 1;
        $scope.search();
      }
      if ($scope.pageNo*($scope.itemsPerPage+1) >= response.data.count) {
        $scope.disableNext = true;
      } else {
        $scope.disableNext = false;
      }
    })
  }

  $http({method : 'GET' , url : '/api/PIM/blog/?state=published&offset=0&limit=5'}).
  then(function(response){
    $scope.recommended = response.data.results;
  });

  $scope.readRecommended = function(pk){
    $scope.getAndRead(pk)
  }

  $scope.getAndRead = function(id){
    $scope.mode = 'read';
    $http({method : 'GET' , url : '/api/PIM/blog/' + id + '/' +'?state=published'}).
    then(function(response){
      $scope.articleInView = response.data;
      for (var i = 0; i < $scope.articleInView.likes.length; i++) {
        if ($scope.articleInView.likes[i].user.cleanUrl() == $scope.me.url.cleanUrl()){
          $scope.liked = true;
        }
      }
    })
  }

  if (typeof $stateParams.id != 'undefined' && $stateParams.action == 'edit') {
    $scope.mode = 'edit';
    $http({method : 'GET' , url : '/api/PIM/blog/' + $stateParams.id + '/?state=all'}).
    then(function(response){
      $scope.editor.url = response.data.url;
      $scope.editor.source = response.data.source;
      $scope.editor.title = response.data.title;
      $scope.editor.header = response.data.header;
      $scope.editor.tags = response.data.tags;
      $scope.editor.mode = 'header';
    })
  } else if ($stateParams.action == 'new') {
    $scope.mode = 'new';
  } else if ($stateParams.id != 'undefined' && $stateParams.id != ''  && $stateParams.action != 'edit') {
    $scope.getAndRead($stateParams.id);
  } else {
    $scope.mode = 'list';
    $scope.filter.state = 'published';
  }

  $scope.$watch(function(){
    return $scope.filter.tags.length;
  }, function(newValue, oldValue){
    $scope.search()
  })

  $scope.toggleState = function(){
    if ($scope.filter.state == 'published') {
      $scope.filter.state = 'saved';
      $scope.filter.user = $scope.me.username;
    } else if ($scope.filter.state == 'saved') {
      $scope.filter.state = 'published';
    }
    $scope.search();
  }

  $scope.toggleUser = function(){
    if ($scope.filter.user == 'all') {
      $scope.filter.user = $scope.me.username;
    } else if ($scope.filter.user == $scope.me.username) {
      $scope.filter.user = 'all';
      $scope.filter.state = 'published';
    }
    $scope.search();
  }

  $scope.delete = function(){
    $http({method : 'DELETE' , url : $scope.articleInView.url}).
    then(function(response){
      $scope.blogs.splice($scope.blogs.indexOf($scope.articleInView),1);
      $scope.mode = 'list';
    });
  }

  $scope.like = function(){
    if ($scope.liked) {
      for (var i = 0; i < $scope.articleInView.likes.length; i++) {
        if ($scope.articleInView.likes[i].user == $scope.me.pk){
          $http({method : 'DELETE' , url : '/api/PIM/blogLike/' + $scope.articleInView.likes[i].pk + '/'}).
          then((function(i) {
            return function() {
              $scope.articleInView.likes.splice(i,1);
              $scope.liked = false;
            }
          })(i));
        }
      }
    } else{
      var dataToSend = {
        user : $scope.me.pk,
        parent : $scope.articleInView.pk,
      }
      $http({method : 'POST' , url : '/api/PIM/blogLike/' , data : dataToSend}).
      then(function(response){
        $scope.liked = true;
        $scope.articleInView.likes.push(response.data);
      })
    }
  }

  $scope.nextPage = function(){
    if ($scope.disableNext) {
      return;
    }
    $scope.pageNo += 1;
    $scope.search();
  }

  $scope.prevPage = function(){
    $scope.pageNo -= 1;
    if ($scope.pageNo <0) {
      $scope.pageNo = 0;
    }
    $scope.search();
  }


  $scope.edit = function(){
    $state.go('home.blog' , { id : getPK($scope.articleInView.url) , action : 'edit'});
  }

  $scope.comment = {text :''};
  $scope.comment = function(){
    var dataToSend = {
      user : $scope.me.pk,
      text : $scope.comment.text,
      parent : $scope.articleInView.pk,
    }
    $http({method : 'POST' , url : '/api/PIM/blogComment/' , data : dataToSend}).
    then(function(response){
      $scope.articleInView.comments.push(response.data);
      $scope.comment.text = '';
    });
  }

  $scope.onCommentDelete = function(index){
    $scope.articleInView.comments.splice(index , 1);
  }

  $scope.goBack = function(){
    $scope.mode = 'list';
    $state.go('home.blog' , { id : '', action : 'list'});
  }

  $scope.viewArticle = function(index){ // if we have the data in the scope and just want to read the artile
    $scope.mode = 'read'
    $scope.articleInView = $scope.blogs[index];
    for (var i = 0; i < $scope.articleInView.likes.length; i++) {
      if ($scope.articleInView.likes[i].user == $scope.me.pk){
        $scope.liked = true;
      }
    }
  }

  $scope.modeToggle = false;

  $scope.loadTags = function(query) {
    return $http.get('/api/PIM/blogTags/?title__contains=' + query)
  };

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 640,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      editor.addButton( 'publishBtn', {
        text: 'Publish',
        icon: false,
        onclick: function() {
          var tags = [];
          for (var i = 0; i < $scope.editor.tags.length; i++) {
            tags.push($scope.editor.tags[i].pk)
          }
          var dataToSend = {
            source : $scope.editor.source,
            header : $scope.editor.header,
            title : $scope.editor.title,
            users : [$scope.me.pk],
            sourceFormat : 'html',
            state : 'published',
            tags : tags,
          };
          
          if ($scope.mode == 'edit') {
            method = 'PATCH';
            url = $scope.editor.url;
          } else if ($scope.mode == 'new') {
            method = 'POST';
            url = '/api/PIM/blog/';
          }

          $http({method : method , url : url, data : dataToSend}).
          then(function(response){
            Flash.create('success' , response.status + ' : ' + response.statusText);
            $scope.editor.source = '';
            $scope.editor.header = '';
            $scope.editor.title = '';
            $scope.editor.tags = [];
            $scope.editor.mode = 'hedaer';
          }, function(response){
            Flash.create('danger' , response.status + ' : ' + response.statusText);
          });
        }
      });
      editor.addButton( 'saveBtn', {
        text: 'Save',
        icon: false,
        onclick: function() {
          tags = '';
          for (var i = 0; i < $scope.editor.tags.length; i++) {
            tags += $scope.editor.tags[i].title;
            if (i != $scope.editor.tags.length-1) {
              tags += ',';
            }
          }
          var dataToSend = {
            source : $scope.editor.source,
            header : $scope.editor.header,
            title : $scope.editor.title,
            users : [$scope.me.pk],
            sourceFormat : 'html',
            state : 'saved',
            tags : tags,
          };

          if ($scope.mode == 'edit') {
            method = 'PATCH';
            url = $scope.editor.url;
          } else if ($scope.mode == 'new') {
            method = 'POST';
            url = '/api/PIM/blog/';
          }

          $http({method : method , url : url, data : dataToSend}).
          then(function(response){
            Flash.create('success' , response.status + ' : ' + response.statusText);
            $scope.editor.source = '';
            $scope.editor.header = '';
            $scope.editor.title = '';
            $scope.editor.tags = [];
            $scope.editor.mode = 'hedaer';
          }, function(response){
            Flash.create('danger' , response.status + ' : ' + response.statusText);
          });
        }
      });
      editor.addButton( 'cancelBtn', {
        text: 'Cancel',
        icon: false,
        onclick: function() {
          if ($scope.mode == 'edit') {
            $state.go('home.blog' , { action:'list'} )
          } else {
            $state.go('home.blog' , {id : '' , action:'list'} )
          }

        }
      });
    },
  };



});
