app.config(function($stateProvider){
  $stateProvider.state('projectManagement.GIT.groups', {
    url: "/groups",
    templateUrl: '/static/ngTemplates/app.GIT.groups.html',
    controller: 'projectManagement.GIT.groups'
  });
});

app.controller('controller.projectManagement.GIT.groups.item' , function($scope ,$http, $users , Flash , $permissions){
  // console.log($scope.edit);
  // console.log($scope.delete);
  // console.log($scope.$parent.$parent);
})

app.controller('controller.projectManagement.GIT.groups.modal' , function($scope ,$http, $users , Flash , $permissions){

  if (typeof $scope.data.pk == 'undefined') {
    $scope.mode = 'new';
    $scope.data = {users : [] , name : '' , description : ''}
  }else {
    $scope.mode = 'edit';
  }

  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response){
      return response.data;
    })
  };
  $scope.getName = function(u) {
    if (typeof u == 'undefined') {
      return '';
    }
    return u.first_name + '  ' +u.last_name;
  }

  $scope.save = function() {
    console.log('in save');
    url = '/api/git/gitGroup/'
    if ($scope.mode == 'new') {
      method = 'POST';
    }else {
      method = 'PATCH';
      url += $scope.data.pk + '/';
    }
    dataToSend = {
      name : $scope.data.name,
      users : $scope.data.users,
      description : $scope.data.description,
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
  $scope.addUser = function() {
    for (var i = 0; i < $scope.data.users.length; i++) {
      if ($scope.data.users[i] == $scope.data.user.pk){
        Flash.create('danger' , 'User already a member of this group')
        return;
      }
    }
    $scope.data.users.push($scope.data.user.pk);
    $scope.data.user = undefined;
  }

})

app.controller('projectManagement.GIT.groups' , function($scope , $users , Flash , $permissions){
  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.GIT.groups.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/git/gitGroup/',
    searchField: 'id',
    deletable : true,
    editorTemplate : '/static/ngTemplates/app.GIT.form.groups.html',
    canCreate : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

  }

})
