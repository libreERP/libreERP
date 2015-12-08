app.controller('controller.mail' , function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash){
  $scope.me = userProfileService.get('mySelf');

  $scope.emails = [];
  $scope.email = {
    uid:1,
    originator : 'http://localhost:8000/api/HR/users/3/',
    subject : ' Internships matching your profile',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who faildit quo minus id .</p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'

  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:2,
    originator : 'http://localhost:8000/api/HR/users/2/',
    subject : 'hould leave you with a much better',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id .</p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'

  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:3,
    originator : 'http://localhost:8000/api/HR/users/1/',
    subject : 'Some text for the subject',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. </p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'

  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:4,
    originator : 'http://localhost:8000/api/HR/users/2/',
    subject : 'Cerntainly more than I knew',
    count : 0,
    selected : false,
    created : new Date(),
    starred : true,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas</p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'

  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:6,
    originator : 'http://localhost:8000/api/HR/users/3/',
    subject : 'JavaScript Operators',
    count : 0,
    selected : false,
    created : new Date(),
    starred : true,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente </p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'
  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:5,
    originator : 'http://localhost:8000/api/HR/users/1/',
    subject : 'using python to interface with Gmail.',
    count : 0,
    selected : false,
    created : new Date(),
    starred : false,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis </p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'

  }
  $scope.emails.push(angular.copy($scope.email))
  $scope.email = {
    uid:6,
    originator : 'http://localhost:8000/api/HR/users/3/',
    subject : 'JavaScript Operators',
    count : 0,
    selected : false,
    created : new Date(),
    starred : true,
    body : '<p><font size="3"><font face="Arial">Hi</font></font></p><p>aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente </p><p>run the following command</p><pre>$ sudo apt-get install python-django<br/></pre><p>Thanks</p><p>Sincerely</p><p>Pradeep Yadav</p><p>SDEII=<br/></p>'
  }
  $scope.emails.push(angular.copy($scope.email))


  $scope.editor = false;
  $scope.viewerMail = 0;
  $scope.$watch('selectAll' , function(newValue , oldValue){
    for (var i = 0; i < $scope.emails.length; i++) {
      $scope.emails[i].selected = newValue;
    }
  })
  $scope.gotoMail = function(index){
    $scope.viewerMail = index;
  }
  $scope.nextMail = function(){
    console.log($scope.viewerMail);
    $scope.viewerMail = $scope.viewerMail + 1;

    if ($scope.viewerMail >= $scope.emails.length){
      $scope.viewerMail =  $scope.viewerMail - 1;
    }
  };
  $scope.deleteMail = function(){
    console.log("came here ");
    selectedMode = false;
    i = $scope.emails.length;
    while (i--) {
      if ($scope.emails[i].selected == true){
        $scope.emails.splice(i,1)
        selectedMode = true;
      }
    }
    if (!selectedMode) {
      $scope.emails.splice($scope.viewerMail, 1);
    }
  };
  $scope.prevMail = function(){
    $scope.viewerMail -= 1;
    if ($scope.viewerMail<=0){
      $scope.viewerMail = 1;
    };
    console.log($scope.viewerMail);
  };


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
      index : '@',
      gotoMail:'=',
    },
    controller : function($scope , userProfileService){
      console.log($scope.index);
      $scope.me = userProfileService.get('mySelf');
      if ($scope.me.url.split('?')[0]==$scope.data.originator) {
        $scope.friend = $scope.data.user;
      }else{
        $scope.friend = $scope.data.originator;
      }
    }
  };
});
