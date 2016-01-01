app.controller("home.blog", function($scope , $state , userProfileService ,  $stateParams , $http , Flash) {
  $scope.me = userProfileService.get('mySelf');
  console.log($stateParams);
  if (typeof $stateParams.id != 'undefined' && $stateParams.action == 'edit') {
    $scope.mode = 'edit';
    $scope.article = $stateParams.id;
  } else if ($stateParams.action == 'new') {
    $scope.mode = 'new';
    $scope.editor = {source : '' , tags : [] , title : '' , header : '' , mode : 'header'};
  } else if ($stateParams.id != 'undefined' && $stateParams.id != ''  && $stateParams.action != 'edit') {
    $scope.mode = 'read';
    $http({method : 'GET' , url : '/api/PIM/blog/' + $stateParams.id + '/'}).
    then(function(response){
      $scope.articleInView = response.data;
    })
  } else {
    $scope.mode = 'list';
    $http({method : 'GET' , url : '/api/PIM/blog/'}).
    then(function(response){
      $scope.blogs = response.data;
    } , function(response){

    })
  }
  $scope.comment = {text :''};
  $scope.comment = function(){
    dataToSend = {
      user : $scope.me.url,
      text : $scope.comment.text,
      parent : $scope.articleInView.url,
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
  }

  $scope.viewArticle = function(index){
    $scope.mode = 'read'
    $scope.articleInView = $scope.blogs[index];
  }

  $scope.modeToggle = false;

  $scope.loadTags = function(query) {
    return $http.get('/api/PIM/blogTags/?title__contains=' + query)
  };

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap print preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 640,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      editor.addButton( 'publishBtn', {
        text: 'Publish',
        icon: false,
        onclick: function() {
          tags = '';
          for (var i = 0; i < $scope.editor.tags.length; i++) {
            tags += $scope.editor.tags[i].title;
            if (i != $scope.editor.tags.length-1) {
              tags += ',';
            }
          }
          dataToSend = {
            source : $scope.editor.source,
            header : $scope.editor.header,
            title : $scope.editor.title,
            users : [$scope.me.url],
            sourceFormat : 'html',
            state : 'published',
            tags : tags,
          };
          $http({method : 'POST' , url : '/api/PIM/blog/', data : dataToSend}).
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
            editor.insertContent('Hello World!');
        }
      });
      editor.addButton( 'cancelBtn', {
        text: 'Cancel',
        icon: false,
        onclick: function() {
          $state.go('home.blog' , {action:'list'} )
        }
      });
    },
  };



});
