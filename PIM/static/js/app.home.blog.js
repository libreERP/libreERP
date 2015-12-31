app.controller("home.blog", function($scope , $state , userProfileService ,  $stateParams , $http , Flash) {
  $scope.me = userProfileService.get('mySelf');
  console.log($stateParams);
  if (typeof $stateParams.id != 'undefined' && $stateParams.action == 'edit') {
    $scope.mode = 'edit';
    $scope.article = $stateParams.id;
  } else if ($stateParams.action == 'new') {
    $scope.mode = 'new';
    $scope.editor = {source : ''};
  } else {
    $scope.mode = 'list';
    $http({method : 'GET' , url : '/api/PIM/blog/'}).
    then(function(response){

    } , function(response){

    })
  }

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
    toolbar : 'saveBtn publishBtn cancelBtn | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
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
            user : [$scope.me.url],
            sourceFormat : 'html',
            title : $scope.editor.title,
            state : 'published',
            tags : tags,
          };
          $http({method : 'POST' , url : '/api/PIM/blog/', data : dataToSend}).
          then(function(response){
            Flash.create('success' , response.status + ' : ' + response.statusText);
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
