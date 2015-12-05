app.controller('controller.mail' , function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash){
  $scope.hey = "ok";
  console.log("loaded");
  email = {
    originator : 'http://localhost:8000/api/HR/users/1/',
    subject : 'some text',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
  }
  $scope.emails = [];
  for (var i = 0; i < 9; i++) {
    $scope.emails.push(angular.copy(email))
  }

  $scope.htmlcontent = '<h2>Try me!</h2>';
  $scope.editor = true;
});

app.directive('emailStrip', function () {
  return {
    templateUrl: '/static/ngTemplates/emailStrip.html',
    restrict: 'E',
    transclude: true,
    replace:true,
    scope:{
      data : '=',
      openChat :'=',
    },
    controller : function($scope , userProfileService){
      $scope.me = userProfileService.get('mySelf');
      if ($scope.me.url.split('?')[0]==$scope.data.originator) {
        $scope.friend = $scope.data.user;
      }else{
        $scope.friend = $scope.data.originator;
      }
    }
  };
});
