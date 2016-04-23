app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.GIT', {
    url: "/GIT",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.GIT.html',
       },
       "menu@projectManagement.GIT": {
          templateUrl: '/static/ngTemplates/app.GIT.menu.html',
          controller : 'projectManagement.GIT.menu',
        },
        "@projectManagement.GIT": {
          templateUrl: '/static/ngTemplates/app.GIT.default.html',
          controller : 'projectManagement.GIT.default',
        }
    }
  })
  .state('projectManagement.GIT.groups', {
    url: "/groups",
    templateUrl: '/static/ngTemplates/app.GIT.groups.html',
    controller: 'projectManagement.GIT.groups'
  })
  .state('projectManagement.GIT.repos', {
    url: "/repos",
    templateUrl: '/static/ngTemplates/app.GIT.repos.html',
    controller: 'projectManagement.GIT.repos'
  })
  .state('projectManagement.GIT.manage', {
    url: "/manage",
    templateUrl: '/static/ngTemplates/app.GIT.manage.html',
    controller: 'projectManagement.GIT.manage'
  })

});

app.controller('projectManagement.GIT.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  $scope.page = 0;

  $scope.fetchNotifications = function() {
    $http({method : 'GET' , url : '/api/git/commitNotification/?limit=10&offset=' + $scope.page * 10}).
    then(function(response) {
      $scope.count = response.data.count;
      $scope.notifications = response.data.results;
      var d = new Date($scope.notifications[0].time);
      $scope.notifications[0].dateShow = true;
      $scope.notifications[0].time = d;
      for (var i = 1; i < $scope.notifications.length; i++) {
        var d2 = new Date($scope.notifications[i].time);
        $scope.notifications[i].time = d2;
        if (d.getDate()!= d2.getDate() || d.getMonth()!= d2.getMonth() || d.getFullYear() != d2.getFullYear() ) {
          $scope.notifications[i].dateShow = true;
          d = d2;
        }else {
          $scope.notifications[i].dateShow = false;
        }
      }
      $scope.exploreNotification(0)
    });
  }

  $scope.exploreNotification = function(index) {
    $aside.open({
      templateUrl : '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
      position:'left',
      size : 'xxl',
      backdrop : true,
      resolve : {
        input : function() {
          return $scope.notifications[index];
        }
      },
      controller : 'projectManagement.GIT.exploreNotification',
    })
  }

  $scope.nextPage = function() {
    if (($scope.page+1)*10 > $scope.count) {
      return;
    }
    $scope.page += 1;
    $scope.fetchNotifications()
  }
  $scope.prevPage = function() {
    if ($scope.page == 0) {
      return;
    }
    $scope.page -= 1;
    $scope.fetchNotifications()
  };

  $scope.fetchNotifications()


});

app.controller('projectManagement.GIT.exploreNotification' , function($scope, $http , input, $anchorScroll, $location , $users) {
  $scope.commit = input;
  $scope.mouseOver = {file  : -1 , line : -1};
  $scope.commentEditor = {file  : -1 , line : -1 , text :'' , mode : 'editor'}; // editor for textarea and preview for the preview
  $scope.lineNums = {}
  $scope.form = {comment : '' , editCommentPK : -1 , backupText : ''};
  $scope.me = $users.get('mySelf');

  $http({method : 'GET' , url : '/api/git/codeComment/?sha=' + $scope.commit.sha}).
  then(function(response) {
    $scope.comments = {};
    for (var i = 0; i < response.data.length; i++) {
      var c = response.data[i];
      if (angular.isDefined($scope.comments[c.path])) {
        $scope.comments[c.path].push(c);
      }else {
        $scope.comments[c.path] = [];
        $scope.comments[c.path].push(c);
      }
    }
  });



  $scope.addComment = function() {
    if ($scope.commentEditor.text.length == 0) {
      return;
    }
    var dataToSend = {
      sha : $scope.commit.sha,
      text : $scope.commentEditor.text,
      path : $scope.data.diffs[$scope.commentEditor.file].path,
      line : $scope.commentEditor.line,
    }
    $http({method : 'POST' , url : '/api/git/codeComment/' , data : dataToSend}).
    then(function(response) {
      $scope.commentEditor = {file  : -1 , line : -1 , text :'' , mode : 'editor'};
      if (!angular.isDefined($scope.comments[response.data.path])) {
        $scope.comments[response.data.path] = [];
      }
      $scope.comments[response.data.path].push(response.data);
    });
  };

  $scope.gotoAnchor = function(x) {
    var newHash = 'anchor-' + x;
    if ($location.hash() !== newHash) {
      $location.hash('anchor-' + x);
    } else {
      $anchorScroll();
    }
  };

  $scope.patchComment = function(c) {
    $http({method : 'PATCH' , url : '/api/git/codeComment/' + c.pk + '/' , data : c}).
    then(function(response) {
      $scope.form.editCommentPK = -1;
    });
  };

  $scope.setEditCursor = function(c) {
    $scope.form.backupText = c.text;
    $scope.form.editCommentPK = c.pk;
    $scope.commentEditor.file = -1;
  };
  $scope.cancelCommentEditor = function(pk) {
    for(key in $scope.comments){
      var cs = $scope.comments[key];
      for (var i = 0; i < cs.length; i++) {
        if (cs[i].pk == pk){
          $scope.comments[key][i].text = $scope.form.backupText;
        }
      }
    }
    $scope.form.editCommentPK = -1;
  }

  $scope.deleteComment = function(pk) {
    $http({method : "DELETE" , url : '/api/git/codeComment/' + pk + '/'}).
    then((function(pk) {
      return function(response) {
        for(key in $scope.comments){
          var cs = $scope.comments[key];
          for (var i = 0; i < cs.length; i++) {
            if (cs[i].pk == pk){
              $scope.comments[key].splice(i,1);
            }
          }
        }
      }
    })(pk));
  };

  $scope.mouseOn = function(fileIndex , lineIndex) {
    $scope.mouseOver = {file : fileIndex , line : lineIndex};
  };

  $scope.mouseLeave = function(fileIndex , lineIndex) {
    if ($scope.mouseOver.file == fileIndex && $scope.mouseOver.line == lineIndex) {
      $scope.mouseOver = {file : -1 , line : -1};
    }
  };

  $scope.showCommentBox = function(fileIndex , lineIndex) {
    if ($scope.commentEditor.file == fileIndex && $scope.commentEditor.line == lineIndex) {
      $scope.commentEditor.file = -1;
    }else {
      $scope.commentEditor.file = fileIndex;
      $scope.commentEditor.line = lineIndex;
      $scope.commentEditor.mode = 'editor';
      $scope.commentEditor.text = '';
    }
  };

  $scope.changeEditorMode = function() {
    if ($scope.commentEditor.mode == 'preview'){
      $scope.commentEditor.mode = 'editor';
    }else {
      $scope.commentEditor.mode = 'preview';
    }
  }

  var params = {
    repo : $scope.commit.repo.pk,
    sha : $scope.commit.sha,
    mode : 'commit',
  }
  $http({method : 'GET' , url : '/api/git/browseRepo/' , params : params }).
  then(function(response) {
    $scope.commitData = response.data;
  });

  var params = {
    repo : $scope.commit.repo.pk,
    sha : $scope.commit.sha,
    mode : 'diff',
  }
  $http({method : 'GET' , url : '/api/git/browseRepo/' , params : params }).
  then(function(response) {
    $scope.data = response.data;
    for (var i = 0; i < $scope.data.diffs.length; i++) {
      var f = $scope.data.diffs[i]; // file
      var lines = f.diff.split('\n');
      var leftStartsWith;
      var leftLineNums;
      var rightStartsWith;
      var rightLineNums;
      var lineNums = [['' , ''],['' , '']];
      for (var j = 2; j < lines.length; j++) {
        var l = lines[j];
        if ((l.match(/@@/g)||[]).length == 2){
          l = l.replace(/@@/g,'').replace(/-/g,'').replace(/\+/g,'');
          var parts = l.split(' ');
          leftStartsWith = parseInt(parts[1].split(',')[0]);
          leftLineNums = parseInt(parts[1].split(',')[1]);
          rightStartsWith = parseInt(parts[2].split(',')[0]);
          rightLineNums = parseInt(parts[2].split(',')[1]);
          lineNums.push(['' , ''])
        }else {
          if (l[0]=='-') {
            lineNums.push([leftStartsWith , ''])
            leftStartsWith += 1;
          }else if (l[0] == '+') {
            lineNums.push(['' , rightStartsWith])
            rightStartsWith += 1;
          }else  {
            lineNums.push([leftStartsWith , rightStartsWith])
            rightStartsWith += 1;
            leftStartsWith += 1;
          }
        }
      }
      $scope.lineNums[f.path] = lineNums;
    }
  });


});


app.controller('projectManagement.GIT.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  var getState = function(input){
    var parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app' , 'projectManagement')
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || parts.length != 3 || parts[1] != 'GIT') {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.app();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index){
    var app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return  $state.is(app.name.replace('app' , 'projectManagement'))
    }
  }

});
