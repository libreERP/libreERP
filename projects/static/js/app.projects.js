app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.projects', {
    url: "/projects",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.projects.html',
       },
       "menu@projectManagement.projects": {
          templateUrl: '/static/ngTemplates/app.projects.menu.html',
          controller : 'projectManagement.projects.menu',
        },
        "@projectManagement.projects": {
          templateUrl: '/static/ngTemplates/app.projects.default.html',
          controller : 'projectManagement.projects.default',
        }
    }
  })
  .state('projectManagement.projects.new', {
    url: "/new",
    templateUrl: '/static/ngTemplates/app.projects.new.html',
    controller: 'projectManagement.projects.new'
  })


});

app.controller('projectManagement.projects.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
    views = [{
      name: 'list',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.projects.item.html',
    }, ];

    $scope.projectsConfig = {
      views: views,
      url: '/api/projects/project/',
      searchField: 'title',
    }
});


app.controller('projectManagement.projects.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
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
      if (a.module != 10 || parts.length != 3 || parts[1] != 'projects') {
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
