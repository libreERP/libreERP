app.config(function($stateProvider){
  $stateProvider.state('projectManagement.GIT.repos', {
    url: "/repos",
    templateUrl: '/static/ngTemplates/app.GIT.repos.html',
    controller: 'projectManagement.GIT.repos'
  });
});

app.controller('controller.projectManagement.GIT.repos.item' , function($scope ,$http, $users , Flash , $permissions){
  $scope.me = $users.get('mySelf');
});

app.controller('projectManagement.GIT.repos.explore' , function($scope , $users , Flash , $permissions , $http, $aside){
  $scope.relPath = '';
  $scope.mode = 'folder';
  $scope.logConfig = {page : 0 , pageSize : 10 , summaryInView : -1};
  $scope.branchInView = 'master';
  var dataToSend = {
    mode : 'overview',
    repo : $scope.tab.data.pk
  }

  $http({method : 'GET' , url : '/api/git/browseRepo/' , params : dataToSend}).
  then(function(response) {
    $scope.overview = response.data;
    $scope.getLogs()
  });
  $scope.nextLogs = function() {
    $scope.logConfig.page += 1;
    $scope.getLogs()
  }

  $scope.prevLogs = function() {
    $scope.logConfig.page -= 1;
    $scope.getLogs()
  }

  $scope.showCommitSummary = function(index) {
    if ($scope.logConfig.summaryInView == index) {
      $scope.logConfig.summaryInView = -1;
      return;
    }else {
      $scope.logConfig.summaryInView = index;
    }
  }
  $scope.diffConfig = {sha : ''};
  $scope.showCommitDiff = function(index){
    $aside.open({
      templateUrl : '/static/ngTemplates/app.GIT.aside.exploreNotification.html',
      position:'left',
      size : 'xxl',
      backdrop : true,
      resolve : {
        input : function() {
          var toReturn = $scope.logs[index];
          toReturn.repo = $scope.tab.data;
          toReturn.sha = toReturn.id;
          toReturn.branch = $scope.branchInView;
          return toReturn;
        }
      },
      controller : 'projectManagement.GIT.exploreNotification',
    })


  }

  $scope.getLogs = function() {
    $scope.logConfig.summaryInView = -1;
    params = {
      mode : 'commits',
      repo : $scope.tab.data.pk,
      page : $scope.logConfig.page,
      limit : $scope.logConfig.pageSize,
      branch : $scope.branchInView
    }
    $http({method : 'GET' , url : '/api/git/browseRepo/' , params : params }).
    then(function(response) {
      $scope.logs = response.data;
      for (var i = 0; i < $scope.logs.length; i++) {
        $scope.logs[i].date = new Date($scope.logs[i].date)
      }
      if ($scope.mode == 'folder') {
        $scope.shaInView = response.data[0].id;
        $scope.fetchFileList()
      }
    });
  }
  $scope.getDiff = function(index) {
    params = {
      repo : $scope.tab.data.pk,
      sha : $scope.logs[index].id,
      mode : 'diff',
    }
    $http({method : 'GET' , url : '/api/git/browseRepo/' , params : params }).
    then(function(response) {
      $scope.commit = response.data;
      console.log($scope.diffs);
    }, function(response) {
      // $scope.getLogs()
    })
  }

  $scope.navigateViaBreadcrumb = function(i) {
    if (i == -1) {
      $scope.relPath = '';
    }else {
      $scope.relPath = $scope.relPath.split(i)[0] + i;
    }
    $scope.fetchFileList()
  }

  $scope.fileInView = {name : '' , content : '' , size : 0}

  $scope.exploreSpecific = function(f) {
    if (f.isDir) {
      if ($scope.relPath.length > 0) {
        $scope.relPath += '/';
      }
      $scope.relPath += f.name ;
      if (f.name == '.') {
        $scope.relPath = '';
      }else if (f.name == '..') {
        parts = $scope.relPath.split('/')
        $scope.relPath = '';
        for (var i = 0; i < parts.length-2; i++) {
          $scope.relPath += parts[i];
          if (i != parts.length-3) {
            $scope.relPath += '/';
          }
        }
      }
      $scope.fetchFileList()
    }else {
      $scope.mode = 'file';
      name = $scope.relPath + '/'+ f.name;
      dataToSend = {
        repo : $scope.tab.data.pk,
        relPath : $scope.relPath,
        name : f.name,
        mode : 'file',
        sha : $scope.shaInView,
      }

      $http({method : 'GET' , url : '/api/git/browseRepo/' , params : dataToSend}).
      then(function(response) {
        $scope.fileInView = response.data;
      });
    }
  }

  $scope.fetchFileList = function() {
    $scope.mode = 'folder';
    dataToSend = {
      repo : $scope.tab.data.pk,
      relPath : $scope.relPath,
      mode : 'folder',
      sha : $scope.shaInView ,
    }
    $http({method : 'GET' , url : '/api/git/browseRepo/' , params : dataToSend}).
    then(function(response) {
      $scope.files = response.data;
    })
  }

  // $scope.fetchFileList()

});

app.controller('controller.projectManagement.GIT.repo.modal' , function($scope ,$http, $users , Flash , $permissions){

  if (typeof $scope.data.pk == 'undefined') {
    $scope.mode = 'new';
    $scope.data = {users : [] , name : '' , description : '' , perms : [] , groups : [], project : undefined}
  }else {
    $scope.mode = 'edit';
    $http({method : 'GET' , url : '/api/projects/project/' + $scope.data.project + '/'}).
    then(function(response) {
        $scope.data.project = response.data;
    });
  }

  $scope.objectSearch = function(query) {
    if ($scope.data.permMode == 'individual') {
      url = '/api/HR/userSearch/?username__contains=' ;
    }else {
      url = '/api/git/gitGroup/?name__contains='
    }
    return $http.get(url + query).
    then(function(response){
      return response.data;
    })
  };
  $scope.getName = function(u) {
    if (typeof u == 'undefined') {
      return '';
    }
    if ($scope.data.permMode == 'individual') {
      return u.first_name + '  ' +u.last_name;
    }else {
      return u.name;
    }
  }
  $scope.data.permMode = 'individual';
  $scope.resetCheckboxes = function() {
    $scope.data.canRead = false;
    $scope.data.canWrite = false;
    $scope.data.canDelete = false;
    $scope.data.limited = false;
  };

  $scope.resetCheckboxes();

  $scope.data.editorIndex = -1;
  $scope.data.editorMode = 'individual';

  $scope.editPerm = function(index) {
    $scope.data.editorIndex = index;
    $scope.data.editorMode = 'individual';
  }

  $scope.savePerm = function(index) {
    dataToSend = {
      canRead : $scope.data.perms[index].canRead,
      canWrite : $scope.data.perms[index].canWrite,
      canDelete : $scope.data.perms[index].canDelete,
      limited : $scope.data.perms[index].limited,
    }
    $http({method : 'PATCH' , url : '/api/git/repoPermission/' + $scope.data.perms[index].pk + '/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.editorIndex = -1;
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })
  }

  $scope.editGroup = function(index) {
    $scope.data.editorMode = 'group';
    $scope.data.editorIndex = index;
  }

  $scope.saveGroup = function(index) {
    var dataToSend = {
      canRead : $scope.data.groups[index].canRead,
      canWrite : $scope.data.groups[index].canWrite,
      canDelete : $scope.data.groups[index].canDelete,
      limited : $scope.data.groups[index].limited,
    };
    $http({method : 'PATCH' , url : '/api/git/groupPermission/' + $scope.data.groups[index].pk + '/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.editorIndex = -1;
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.projectSearch = function(query) {
    return $http.get('/api/projects/project/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  }

  $scope.save = function() {
    var url = '/api/git/repo/'
    if ($scope.mode == 'new') {
      method = 'POST';
    }else {
      method = 'PATCH';
      url += $scope.data.pk + '/';
    }
    var perms = []
    for (var i = 0; i < $scope.data.perms.length; i++) {
      perms.push($scope.data.perms[i].pk)
    }
    var groups = []
    for (var i = 0; i < $scope.data.groups.length; i++) {
      groups.push($scope.data.groups[i].pk)
    }

    var dataToSend = {
      name : $scope.data.name,
      description : $scope.data.description,
      perms : perms,
      groups : groups,
    };
    if (typeof $scope.data.project != 'undefined' && $scope.data.project != null) {
        dataToSend.project = $scope.data.project.pk;
    };
    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.mode = 'edit';
      $scope.data.pk = response.data.pk;
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })


  }

  $scope.deletePerm = function(index) {
    $http({method : 'DELETE' , url : '/api/git/repoPermission/' + $scope.data.perms[index].pk + '/' }).
    then((function(index) {
      return function(response) {
        $scope.data.perms.splice(index,1);
      }
    })(index));
  }
  $scope.deleteGroup = function(index) {
    $http({method : 'DELETE' , url : '/api/git/groupPermission/' + $scope.data.groups[index].pk + '/' }).
    then((function(index) {
      return function(response) {
        $scope.data.groups.splice(index,1);
      }
    })(index));
  }

  $scope.addPermission = function() {
    var dataToSend = {
      user : $scope.data.object.pk,
      canRead : $scope.data.canRead,
      canWrite : $scope.data.canWrite,
      canDelete : $scope.data.canDelete,
      limited : $scope.data.limited,
    }
    if ($scope.data.permMode == 'individual') {
      for (var i = 0; i < $scope.data.perms.length; i++) {
        if ($scope.data.perms[i].user == $scope.data.object.pk){
          Flash.create('danger' , 'User already a member of this Repo')
          return;
        }
      }
      $http({method : 'POST' , url : '/api/git/repoPermission/' , data : dataToSend }).
      then(function(response) {
        $scope.data.perms.push(response.data);
        $scope.data.object = undefined;
        $scope.resetCheckboxes();
        $scope.save();
      })
    }else {
      for (var i = 0; i < $scope.data.groups.length; i++) {
        if ($scope.data.groups[i].pk == $scope.data.object.pk){
          Flash.create('danger' , 'Group already a member of this Repo')
          return;
        }
      };
      var dataToSend = {
        group : $scope.data.object.pk,
        canRead : $scope.data.canRead,
        canWrite : $scope.data.canWrite,
        canDelete : $scope.data.canDelete,
      };
      $http({method : 'POST' , url : '/api/git/groupPermission/' , data : dataToSend}).
      then(function(response) {
        $scope.data.groups.push(response.data);
        $scope.data.object = undefined;
        $scope.resetCheckboxes();
        $scope.save();
      });

    }
  }
});

app.controller('projectManagement.GIT.repos' , function($scope , $users , Flash , $permissions){

  $scope.data = {tableData : []}

  var views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.GIT.repos.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/git/repo/',
    searchField: 'id',
    deletable : true,
    editorTemplate : '/static/ngTemplates/app.GIT.form.repo.html',
    canCreate : true,
    itemsNumPerView : [12,24,48],
  }
  $scope.tableAction = function(target , action , mode){
    if (action == 'repoBrowser') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Browse Repo : ' + $scope.data.tableData[i].name , cancel : true , app : 'repoBrowser' , data : {pk : target , name : $scope.data.tableData[i].name} , active : true})
        }
      }
    }
  }
  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

});
