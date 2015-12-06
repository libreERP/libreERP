app.controller('controller.mail' , function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash){
  $scope.hey = "ok";
  console.log("loaded");
  $scope.email = {
    originator : 'http://localhost:8000/api/HR/users/3/',
    subject : 'Some text for the subject',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
  }
  $scope.emails = [];
  for (var i = 0; i < 9; i++) {
    $scope.emails.push(angular.copy($scope.email))
  }
  $scope.me = userProfileService.get('mySelf');
  $scope.htmlcontent = '<p><font size="4"><font face="Arial">Hi</font></font></p><p>This is just to tell you about the recent development in the governments speed of liberalization and the upcoming will best thing that can happen.</p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII, PS, SumTotal Systems<br/></p>';
  $scope.editor = false;
  $scope.reply = function(){
    $scope.editor=!$scope.editor;
  }
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
