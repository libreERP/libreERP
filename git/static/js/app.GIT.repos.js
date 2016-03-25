
app.controller('controller.projectManagement.GIT.repo.modal' , function($scope ,$http, $users , Flash , $permissions){

  if (typeof $scope.data.pk == 'undefined') {
    $scope.mode = 'new';
    $scope.data = {users : [] , name : '' , description : '' , perms : [] , groups : []}
  }else {
    $scope.mode = 'edit';
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
  $scope.data.canRead = false;
  $scope.data.canWrite = false;
  $scope.data.canDelete = false;
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
    dataToSend = {
      canRead : $scope.data.groups[index].canRead,
      canWrite : $scope.data.groups[index].canWrite,
      canDelete : $scope.data.groups[index].canDelete,
    }
    $http({method : 'PATCH' , url : '/api/git/groupPermission/' + $scope.data.groups[index].pk + '/' , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.editorIndex = -1;
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })
  }

  $scope.save = function() {
    url = '/api/git/repo/'
    if ($scope.mode == 'new') {
      method = 'POST';
    }else {
      method = 'PATCH';
      url += $scope.data.pk + '/';
    }
    perms = []
    for (var i = 0; i < $scope.data.perms.length; i++) {
      perms.push($scope.data.perms[i].pk)
    }
    groups = []
    for (var i = 0; i < $scope.data.groups.length; i++) {
      groups.push($scope.data.groups[i].pk)
    }

    dataToSend = {
      name : $scope.data.name,
      description : $scope.data.description,
      perms : perms,
      groups : groups,
    }
    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      Flash.create('success' , response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    })


  }

  $scope.removeUser = function(index) {
    $scope.data.users.splice(index,1);
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
    dataToSend = {
      user : $scope.data.object.pk,
      canRead : $scope.data.canRead,
      canWrite : $scope.data.canWrite,
      canDelete : $scope.data.canDelete,
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
        $scope.data.canRead = false;
        $scope.data.canWrite = false;
        $scope.data.canDelete = false;
        $scope.save();
      })
    }else {
      for (var i = 0; i < $scope.data.groups.length; i++) {
        if ($scope.data.groups[i].pk == $scope.data.object.pk){
          Flash.create('danger' , 'Group already a member of this Repo')
          return;
        }
      }

      dataToSend = {
        group : $scope.data.object.pk,
        canRead : $scope.data.canRead,
        canWrite : $scope.data.canWrite,
        canDelete : $scope.data.canDelete,
      }
      $http({method : 'POST' , url : '/api/git/groupPermission/' , data : dataToSend}).
      then(function(response) {
        $scope.data.groups.push(response.data);
        $scope.data.object = undefined;
        $scope.data.canRead = false;
        $scope.data.canWrite = false;
        $scope.data.canDelete = false;
        $scope.save();
      })

    }
  }

})



app.controller('projectManagement.GIT.repos' , function($scope , $users , Flash , $permissions){

  views = [{name : 'list' , icon : 'fa-th-large' ,
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
    console.log(target , action , mode);
    console.log($scope.data.tableData);

  }


});
