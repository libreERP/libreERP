var app = angular.module('app' , ['ui.bootstrap', 'ngSanitize', 'ngTagsInput' , 'ui.tinymce']);

app.config(function( $httpProvider ){

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.controller('public.blogs.donate' , function($scope, $http){

  console.log('loaded');

  $scope.categorySearch = function(query) {
    return $http.get('/api/PIM/blogTags/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.mode = 'new'

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
          var tmp = document.createElement("DIV");
          tmp.innerHTML = $scope.editorText;
          var header = tmp.textContent || tmp.innerText || "";

          var tags = []
          tags.push($scope.category.pk)


          var dataToSend = {
            source : $scope.editorText,
            header : header.substring(0,400),
            title : $scope.title,
            users : [1],
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
            $scope.editorText = '';
            $scope.title = '';
            $scope.category = null;
            alert('Success')
          }, function(response){
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
          dataToSend = {
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
