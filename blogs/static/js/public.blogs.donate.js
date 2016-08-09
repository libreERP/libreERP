var app = angular.module('app' , ['ui.bootstrap', 'ngSanitize' , 'ui.tinymce']);

app.config(function( $httpProvider ){

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;

});

app.controller('public.blogs.donate' , function($scope, $http, $timeout){

  $scope.message = {show : false , 'text' : '' , class : ''}
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
            users : [USER],
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
          if ($scope.editorText.length <700) {
            console.log("came to min length");
            $scope.message.show = true;
            $scope.message.text = 'Article too short to be published , are you sure if you done!' ;
            $scope.message.class = 'warning';
            $scope.$apply();
            $timeout(function(){
              $scope.message.show = false;
            },5000);
            return;
          }
          $http({method : method , url : url, data : dataToSend}).
          then(function(response){
            $scope.editorText = '';
            $scope.title = '';
            $scope.category = null;
            $scope.message.show = true;
            $scope.message.text = 'Article posted succesfully';
            $scope.message.class = 'success';
            $timeout( function() {
              $scope.message.show = false;
              $scope.message.text = ''
            }, 5000);
          }, function(response){
            $scope.message.show = true;
            $scope.message.class = 'danger';
            $timeout(3000 , function() {
              $scope.message.show = false;
              $scope.message.text = ''
            },5000);
          });
        }
      });
    },
  };
});
