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
    var n = $scope.notifications[index];
    $aside.open({
      templateUrl : '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
      position:'left',
      size : 'xxl',
      backdrop : true,
      resolve : {
        input : function() {
          return {sha : n.sha , repo : n.repo , user : n.user}
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

app.controller('projectManagement.GIT.exploreNotification' , function($scope, $http , input) {
  $scope.commit = input;
  $scope.mouseOver = {file  : -1 , line : -1};
  $scope.commentEditor = {file  : -1 , line : -1};
  $scope.lineNums = {}

  $scope.mouseOn = function(fileIndex , lineIndex) {
    $scope.mouseOver = {file : fileIndex , line : lineIndex};
  };

  $scope.mouseLeave = function(fileIndex , lineIndex) {
    if ($scope.mouseOver.file == fileIndex && $scope.mouseOver.line == lineIndex) {
      $scope.mouseOver = {file : -1 , line : -1};
    }
  };

  $scope.addComment = function(fileIndex , lineIndex) {
    if ($scope.commentEditor.file == fileIndex && $scope.commentEditor.line == lineIndex) {
      $scope.commentEditor = {file  : -1 , line : -1};
    }else {
      $scope.commentEditor = {file : fileIndex , line : lineIndex};
    }
  };

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
    parts = input.name.split('.');
    // console.log(parts);
    return input.name.replace('app' , 'projectManagement')
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 10 || parts.length != 3 || parts[1] != 'GIT') {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.app();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index){
    app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return  $state.is(app.name.replace('app' , 'projectManagement'))
    }
  }

});
