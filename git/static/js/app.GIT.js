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
