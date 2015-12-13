parseMailboxStatus = function(raw){
  name = raw[0].split('"')[1];
  onServer = name;
  if (name.indexOf('/') != -1) {
    name = name.split('/')[1];
  }
  toReturn = {'name' : name , 'onServer' : onServer};
  return toReturn;
}

parseEmailFlags = function(raw){
  return raw.replace(/\W/g, ' ').replace(/  +/g, ' ').replace(/(^\s+|\s+$)/g, '').split(' ');
  // replacing non alphabetical chars with space , then multiple spaces with one , then removing the trailing spaces , then split
}

app.controller('controller.mail' , function($scope , $http , $timeout , userProfileService , $aside , $interval , $window , Flash , $sanitize , $sce){
  $scope.me = userProfileService.get('mySelf');
  $scope.viewerMail = -1;
  $scope.editor = false;
  $scope.folders = [];
  $scope.folderSelected = 'INBOX';
  $scope.page = 0;
  $scope.getMailbox = function(query){
    if (typeof query == 'undefined') {
      query = 'ALL'
    };
    $scope.emails = [];
    url = '/api/mail/mailbox/' ;
    dataToSend = {folder : $scope.folderSelected , page : $scope.page , query : query}
    $http({method : 'GET' , url : url , params : dataToSend}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        tempEmail = response.data[i];
        for (key in tempEmail) {
          if (key == 'date') {
            date = new Date(tempEmail.date);
            tempEmail[key] = date;
          }
        }
        tempEmail.flags = parseEmailFlags(tempEmail.flags)
        tempEmail.selected = false;
        tempEmail.starred = tempEmail.flags.indexOf('Flagged') != -1;
        tempEmail.seen = tempEmail.flags.indexOf('Seen') != -1;
        $scope.emails.push(tempEmail)
      }
      if ($scope.emails.length !=0) {
        $scope.viewerMail = 0;
        $scope.emails[0].seen = true;
      }
    });
  }

  $scope.search = function(){
    query = 'SUBJECT /'+ $scope.textToSearch + '/';
    $scope.getMailbox(query)
    $scope.viewerMail = -1;
  };

  $scope.getMailbox();

  $http({method : 'GET' , url : '/api/mail/folders/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i][0] == 'OK'){
        rawString = response.data[i][1];
        // var match = '""INBOX" (MESSAGES 9 RECENT 0 UIDNEXT 23 UIDVALIDITY 1 UNSEEN 0)"'.exec("Sample text")
        $scope.folders.push(parseMailboxStatus(rawString))
      }
    }
  });
  $scope.$watch('viewerMail' , function(newValue , oldValue){
    $scope.emailInView = $scope.emails[newValue];
    if (newValue<0) {
      return;
    }
    if (typeof $scope.emails[newValue].body == 'undefined') {
      $scope.getMailBody($scope.emails[newValue].uid , $scope.folderSelected)
    }
  });

  $scope.$watch('selectAll' , function(newValue , oldValue){
    if (typeof $scope.emails == 'undefined') {
      return;
    }
    for (var i = 0; i < $scope.emails.length; i++) {
      $scope.emails[i].selected = newValue;
    }
  });

  $scope.moveMails = function(folder){
    selectedMode = false;
    for (var i = 0; i < $scope.emails.length; i++) {
      if ($scope.emails[i].selected){
        dataToSend = {action: 'move' , folder : $scope.folderSelected , to : folder, uid: $scope.emails[i].uid};
        $http({method:'PATCH' , url:'/api/mail/email/' , params : dataToSend});
        selectedMode = true;
      }

    }
    if (!selectedMode) {
      dataToSend = {action: 'move' , folder : $scope.folderSelected , to : folder, uid: $scope.emails[$scope.viewerMail].uid};
      $http({method:'PATCH' , url:'/api/mail/email/' , params : dataToSend});
    }
    $scope.deleteMail(false);
    $scope.emailInView = $scope.emails[0];
    if (typeof $scope.emails[0].body == 'undefined') {
      $scope.getMailBody($scope.emails[0].uid , $scope.folderSelected)
    }
  };
  $scope.deleteMail = function(remove){
    // if remove == true then only remove it from the UI and do not send the delete commend to the server
    if (typeof remove == 'undefined') {
      remove = false;
    }
    $scope.selectAll = false;
    selectedMode = false;
    i = $scope.emails.length;
    while (i--) {
      if ($scope.emails[i].selected == true){
        if (remove) {
          dataToSend = {action : 'addFlag' , flag : 'Deleted' , folder : $scope.folderSelected , uid : $scope.emails[i].uid};
          $http({method : 'PATCH' , url : '/api/mail/email/' , params : dataToSend})
        }
        $scope.emails.splice(i,1)
        selectedMode = true;
      }
    }
    if (!selectedMode) {
      if (remove) {
        dataToSend = {action : 'addFlag' , flag : 'Deleted' , folder : $scope.folderSelected , uid : $scope.emails[$scope.viewerMail].uid};
        $http({method : 'PATCH' , url : '/api/mail/email/' , params : dataToSend})
      }
      $scope.emails.splice($scope.viewerMail, 1);
    }
    $scope.emailInView = $scope.emails[0];
    if (typeof $scope.emails[0].body == 'undefined') {
      $scope.getMailBody($scope.emails[0].uid , $scope.folderSelected)
    }
  };
  $scope.flagMail = function(index , flag , action){
    tempEmail = $scope.emails[index];
    if (typeof action == 'undefined') {

      if (tempEmail.starred == false) {
        action = 'addFlag';
      }else {
        action = 'removeFlag';
      }
    }

    $scope.emails[index].starred  = !tempEmail.starred;
    dataToSend = {action : action , flag : flag , folder : $scope.folderSelected , uid : tempEmail.uid};
    $http({method : 'PATCH' , url : '/api/mail/email/' , params : dataToSend})
  };
  $scope.flagMails = function(mode){
    for (var i = 0; i < $scope.emails.length; i++) {
      if ($scope.emails[i].selected) {
        $scope.flagMail(i , 'Flagged' , mode)
        $scope.emails[i].starred = mode=='addFlag';
      }
    }
  }

  $scope.getMailBody = function(uid , folder){
    dataToSend = {folder : folder , uid : uid}
    $http({method : 'GET' , url : '/api/mail/email/' , params: dataToSend}).
    then(function(response){
      for (var i = 0; i < $scope.emails.length; i++) {
        if ($scope.emails[i].uid == response.data.uid){
          $scope.emails[i].body = response.data.body;
        }
      }
    });
  }

  $scope.nextPage = function(){
    $scope.page += 1;
    $scope.getMailbox();
    $scope.emailInView = [];
    $scope.viewerMail = -1;
    $scope.selectAll = false;
  }
  $scope.prevPage = function(){
    $scope.selectAll = false;
    $scope.page -=1;
    if ($scope.page <0) {
      $scope.page = 0;
      return;
    }
    $scope.getMailbox();
    $scope.emailInView = [];
    $scope.viewerMail = -1;
  }
  $scope.changeFolder = function(to){
    $scope.page = 0;
    $scope.folderSelected = to;
    $scope.getMailbox();
    $scope.emailInView = [];
    $scope.viewerMail = -1;
    $scope.selectAll = false;
  }

  $scope.gotoMail = function(index){
    $scope.viewerMail = parseInt(index);
    $scope.emails[index].seen = true;
  }
  $scope.nextMail = function(){
    $scope.viewerMail += 1;
    if ($scope.viewerMail >= $scope.emails.length){
      $scope.viewerMail =  $scope.viewerMail - 1;
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
      flagMail:'=',
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
