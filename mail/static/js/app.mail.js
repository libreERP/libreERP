app.controller('controller.mail' , function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash , $sanitize , $sce){
  $scope.me = userProfileService.get('mySelf');
  $scope.viewerMail = -1;
  $scope.editor = false;
  $scope.folders = [];
  $scope.folderSelected = 'INBOX';

  $scope.getMailbox = function(folder){
    $scope.emails = [];
    if (typeof folder == 'undefined') {
      folder = 'INBOX';
    }
    url = '/api/mail/mailbox/?folder=' + folder;
    $http({method : 'GET' , url : url}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        tempEmail = response.data[i];
        for (key in tempEmail) {
          if (key == 'body') {
            // tempEmail[key] = $sce.trustAsHtml(tempEmail.body)
          }
          if (key == 'date') {
            date = new Date(tempEmail.date);
            tempEmail[key] = date;
          }
        }
        tempEmail.selected = false;
        $scope.emails.push(tempEmail)
      }
      $scope.viewerMail = 0;
    });
  }

  $scope.getMailbox();

  $http({method : 'GET' , url : '/api/mail/folders/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i][0] == 'OK'){
        rawString = response.data[i][1];
        // var match = '""INBOX" (MESSAGES 9 RECENT 0 UIDNEXT 23 UIDVALIDITY 1 UNSEEN 0)"'.exec("Sample text")

        folderName = rawString[0].split('"')[1];
        onServer = folderName;
        if (folderName.indexOf('/') != -1) {
          folderName = folderName.split('/')[1];
        }
        $scope.folders.push({name : folderName , onServer : onServer})
      }
    }
  });
  $scope.$watch('viewerMail' , function(newValue , oldValue){
    $scope.emailInView = $scope.emails[newValue];
  });

  $scope.$watch('selectAll' , function(newValue , oldValue){
    if (typeof $scope.emails == 'undefined') {
      return;
    }
    for (var i = 0; i < $scope.emails.length; i++) {
      $scope.emails[i].selected = newValue;
    }
  })
  $scope.changeFolder = function(to){
    $scope.folderSelected = to;
    $scope.getMailbox(to);
    $scope.emailInView = [];
    $scope.viewerMail = -1;
  }
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
