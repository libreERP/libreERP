parseMailboxStatus = function(raw){
  name = raw[0].match(/"(.*?)"/)[1];
  onServer = name;
  if (name.indexOf('/') != -1) {
    name = name.split('/')[1];
  }
  unseen = raw[0].match(/[A-Z]+\s*\d{1,2}/g)[4];
  newMail = parseInt(unseen.match(/\s*\d/));
  toReturn = {'name' : name , 'onServer' : onServer , 'new' : newMail};
  return toReturn;
}

parseEmailFlags = function(raw){
  return raw.replace(/\W/g, ' ').replace(/  +/g, ' ').replace(/(^\s+|\s+$)/g, '').split(' ');
  // replacing non alphabetical chars with space , then multiple spaces with one , then removing the trailing spaces , then split
}

app.controller('controller.mail' , function($scope , $http , $timeout , $users , $aside , $interval , $window , Flash , $sanitize , $sce , removeHtmlTags , $stateParams , $state){

  if ($stateParams.folder == '') {
    $state.transitionTo('home.mail' , {folder:'inbox'})
  }
  $scope.me = $users.get('mySelf');
  $scope.viewerMail = -1;
  $scope.folders = [];
  $scope.folderSelected = 'INBOX'; // name of the folder on the server, for mail its something like [GMAIL]/Sent Items
  $scope.page = 0;
  $scope.attach = function(){
    var fd = new FormData();
    fd.append('attachment' , $scope.editorData.file);
    fd.append('user' , $scope.me.pk);
    $http({method : 'POST' , url : '/api/mail/attachment/', data : fd  , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      response.data.filename = response.data.attachment.split('_' + $scope.me.username + '_')[1];
      $scope.editorData.attachments.push(response.data)
      $scope.editorData.file = new File([""], "");
    });
  };
  $scope.resetEditor = function(){
    $scope.showCC = false;
    $scope.editor = false;
    $scope.showBCC = false;
    $scope.editorData = [];
    $scope.editorData.attachments = [];
    $scope.editorData.file = new File([""], "");
  }
  $scope.resetEditor();

  $scope.showExtraControls = function(mode){
    if (mode == 'cc') {
      $scope.showCC = true;
    } else if (mode == 'bcc') {
      $scope.showBCC = true;
    }
  }
  $scope.getMailbox = function(query){
    $scope.emailInView = [];
    $scope.viewerMail = -1;
    $scope.selectAll = false;
    $scope.resetEditor()
    $scope.editor = false;

    if (typeof query == 'undefined') {
      var query = 'ALL'
    };
    $scope.emails = [];
    var url = '/api/mail/mailbox/' ;
    var dataToSend = {folder : $scope.folderSelected , page : $scope.page , query : query}
    $http({method : 'GET' , url : url , params : dataToSend}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        var tempEmail = response.data[i];
        for (key in tempEmail) {
          if (key == 'date') {
            var date = new Date(tempEmail.date);
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

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 500,
    toolbar : 'saveBtn publishBtn cancelBtn headerMode bodyMode | undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
  };

  $scope.reply = function(mode){
    $scope.editor=!$scope.editor;
    var mail = angular.copy($scope.emailInView);
    mail.attachments = [];
    var parts = mail.subject.split(':');
    mail.subject = parts[parts.length-1];
    var replyStr;
    if (typeof mode == 'undefined' ) {
      mail.to = mail.sender;
      mail.cc = '';
      mail.subject = 'Re :' + mail.subject;
      replyStr = '<div><br>------------Original message----------------<br>'

    } else if (mode == 'all') {
      mail.to = mail.sender;
      mail.subject = 'Re :' + mail.subject;
      replyStr = '<div><br>------------Original message----------------<br>'

    } else if (mode == 'forward') {
      mail.subject = 'Fwd :' + mail.subject;
      mail.to = '';
      mail.cc = '';
      replyStr = '<br><br><div>-----------Forwarded message---------------<br>'
      $http({method : 'POST' , url : '/api/mail/mailAttachment/?folder=' + $scope.folderSelected + '&uid=' + $scope.emailInView.uid }).
      then(function(response) {
        for (var i = 0; i < response.data.length; i++) {
          response.data[i].filename = response.data[i].attachment.split('_' + $scope.me.username + '_')[1];
          $scope.editorData.attachments.push(response.data[i]);
        }
        console.log($scope.editorData);
      });
    }
    var frm =mail.sender.match(/\w*@\w*.\w*/)[0];
    var to = $scope.emailInView.to.match(/\w*@\w*.\w*/)[0];
    replyStr += 'From : <strong>'+ mail.sender.split('<')[0] +'</strong><<a href="mailto:'+ frm + '">'+ frm +'</a>><br>'
    replyStr += 'Date : '+ mail.date + '<br>'
    replyStr += 'subject : '+ mail.subject.split(':')[1] + '<br>'
    replyStr += 'To : <strong>'+ angular.copy($scope.emailInView.to.split('<')[0]) + '</strong><<a href="mailto:'+ to + '">' + to + '</a>><br></div><br>'
    mail.body = replyStr + mail.body;
    if (mail.bodyFormat == 'plain') {
      mail.plainBody = replyStr + mail.plainBody;
    }

    $scope.editorData = mail;
  }
  $scope.newMail = function(){
    $scope.resetEditor();
    $scope.editor = true;
  }

  $scope.sendMail = function(){
    var attachments = [];
    for (var i = 0; i < $scope.editorData.attachments.length; i++) {
      attachments.push( $scope.editorData.attachments[i].pk);
    }

    var fd = new FormData();
    fd.append('subject' , $scope.editorData.subject);
    if ($scope.editorData.bodyFormat == 'plain') {
      fd.append('body' , $scope.editorData.plainBody);
    } else {
      fd.append('body' , $scope.editorData.body);
    }
    if (typeof $scope.editorData.to == 'undefined' || $scope.editorData.to.length <=2) {
      Flash.create('danger' , 'No reciepient specified');
      return;
    } else {
      fd.append('to' , $scope.editorData.to);
    }
    if ('cc' in $scope.editorData && $scope.editorData.cc.length > 2) {
      fd.append('cc' , $scope.editorData.cc);
    }
    if ('bcc' in $scope.editorData && $scope.editorData.bcc.length > 2) {
      fd.append('bcc' , $scope.editorData.bcc);
    }
    if (attachments.length > 0) {
      fd.append('attachments' , attachments);
    }
    $scope.editor = false;
    $http({method : 'POST' , url : '/api/mail/send/', data : fd  , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      if (response.status == 200) {
        Flash.create('success', response.status + ' : ' + response.statusText );
        $scope.resetEditor();
      } else {
        Flash.create('danger', response.status + ' : ' + response.statusText );
      }
    });
  }

  $scope.saveMail = function(){
    $scope.editor = false;
  }

  $scope.search = function(){
    query = 'SUBJECT /'+ $scope.textToSearch + '/';
    $scope.getMailbox(query)
  };

  // getting the list of folders and status
  $http({method : 'GET' , url : '/api/mail/folders/'}).
  then(function(response){
    for (var i = 0; i < response.data.length; i++) {
      if (response.data[i][0] == 'OK'){
        rawString = response.data[i][1];
        // var match = '""INBOX" (MESSAGES 9 RECENT 0 UIDNEXT 23 UIDVALIDITY 1 UNSEEN 0)"'.exec("Sample text")
        // i dont know why but if you call the parseMailboxStatus function seperately and assign the outout to a
        // variable and then push that into the folders its not working
        $scope.folders.push(parseMailboxStatus(rawString))
      }
      $scope.folderSelected = 'INBOX';
    }
    $scope.getMailbox();
  });
  $scope.$watch('viewerMail' , function(newValue , oldValue){
    if (newValue<0) {
      return;
    }
    $scope.emailInView = $scope.emails[newValue];
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
    var selectedMode = false;
    for (var i = 0; i < $scope.emails.length; i++) {
      if ($scope.emails[i].selected){
        var dataToSend = {action: 'move' , folder : $scope.folderSelected , to : folder, uid: $scope.emails[i].uid};
        $http({method:'PATCH' , url:'/api/mail/email/' , params : dataToSend});
        selectedMode = true;
      }

    }
    if (!selectedMode) {
      var dataToSend = {action: 'move' , folder : $scope.folderSelected , to : folder, uid: $scope.emails[$scope.viewerMail].uid};
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
      var remove = false;
    }
    $scope.selectAll = false;
    var selectedMode = false;
    var i = $scope.emails.length;
    while (i--) {
      if ($scope.emails[i].selected == true){
        if (!remove) {
          var dataToSend = {action : 'move' , folder : $scope.folderSelected,to : 'INBOX.Trash', uid : $scope.emails[i].uid};
          $http({method : 'PATCH' , url : '/api/mail/email/' , params : dataToSend})
        }
        $scope.emails.splice(i,1)
        selectedMode = true;
      }
    }
    if (!selectedMode) {
      if (!remove) {
        var dataToSend = {action : 'move' , folder : $scope.folderSelected,to : 'INBOX.Trash' , uid : $scope.emails[$scope.viewerMail].uid};
        $http({method : 'PATCH' , url : '/api/mail/email/' , params : dataToSend})
      }
      $scope.emails.splice($scope.viewerMail, 1);
    }
    $scope.emailInView = $scope.emails[0];
    if ($scope.emails.length == 0) {
      $scope.getMailbox();
      return;
    }
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

  $scope.downloadFile = function(filename) {
    $window.open('/api/mail/mailAttachment/?folder=' + $scope.folderSelected + '&uid=' + $scope.emailInView.uid + '&file=' + filename);
  };

  $scope.getMailBody = function(uid , folder , format){
    if (typeof format == 'undefined') {
      format = 'html'
    }
    dataToSend = {folder : folder , uid : uid , mode : format}
    $http({method : 'GET' , url : '/api/mail/email/' , params: dataToSend}).
    then(function(response){
      if (response.data.body == null) {
        $scope.getMailBody(response.data.uid , response.data.folder , 'plain')
        return;
      }
      for (var i = 0; i < $scope.emails.length; i++) {
        if ($scope.emails[i].uid == response.data.uid){
            $scope.emails[i].attachments = response.data.attachments;
            if (response.config.params.mode == 'plain') {
              $scope.emails[i].plainBody = response.data.body;
              $scope.emails[i].bodyFormat = 'plain';
            } else {
              $scope.emails[i].body = $sce.trustAsHtml(response.data.body);
              $scope.emails[i].bodyFormat = 'html';
              $scope.emails[i].body = response.data.body;
            }
            $scope.emailInView = $scope.emails[i];
          }
        }
      });
  }

  $scope.nextPage = function(){
    if ($scope.emails.length != 9) {
      return;
    }
    $scope.page += 1;
    $scope.getMailbox();
  }

  $scope.prevPage = function(){
    $scope.selectAll = false;
    $scope.page -=1;
    if ($scope.page <0) {
      $scope.page = 0;
      return;
    }
    $scope.getMailbox();
  }

  $scope.changeFolder = function(to){
    console.log(to);
    // $state.go('home.mail' , {folder : to} )
    // $stateParams.folder = to.split('/')[1];
    $scope.page = 0;
    $scope.folderSelected = to;
    $scope.getMailbox();
  }

  $scope.gotoMail = function(index){
    $scope.viewerMail = parseInt(index);
    $scope.emails[index].seen = true;
    for (var i = 0; i < $scope.folders.length; i++) {
      if ($scope.folders[i].onServer== $scope.folderSelected || $scope.folders[i].name == 'All Mail'){
        $scope.folders[i].new -= 1;
        if ($scope.folders[i].new < 0) {
          $scope.folders[i].new = 0;
        }
      }
    }
    $scope.resetEditor();
    $scope.editor = false;
  }

  $scope.nextMail = function(){
    $scope.viewerMail += 1;
    if ($scope.viewerMail >= $scope.emails.length){
      $scope.viewerMail =  $scope.viewerMail - 1;
    }
  };

  $scope.prevMail = function(){
    $scope.viewerMail -= 1;
    if ($scope.viewerMail<0){
      $scope.viewerMail = 0;
    };
  };
});

app.factory('removeHtmlTags', function () {
    return function strip_tags(input, allowed) {
      allowed = (((allowed || '') + '')
        .toLowerCase()
        .match(/<[a-z][a-z0-9]*>/g) || [])
        .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
      var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
      return input.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
          return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
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
      viewing : '=',
      gotoMail:'=',
      flagMail:'=',
    },
    controller : function($scope , $users){
      $scope.me = $users.get('mySelf');
      if ($scope.me.url.split('?')[0]==$scope.data.originator) {
        $scope.friend = $scope.data.user;
      }else{
        $scope.friend = $scope.data.originator;
      }
    }
  };
});
