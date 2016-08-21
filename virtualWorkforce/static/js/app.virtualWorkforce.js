app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.virtualWorkforce', {
    url: "/virtualWorkforce",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.virtualWorkforce.html',
       },
       "menu@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/app.virtualWorkforce.menu.html',
          controller : 'businessManagement.virtualWorkforce.menu',
        },
        "@businessManagement.virtualWorkforce": {
          templateUrl: '/static/ngTemplates/app.virtualWorkforce.default.html',
        }
    }
  })
  .state('businessManagement.virtualWorkforce.controlRoom', {
    url: "/controlRoom",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.controlRoom.html',
    controller: 'businessManagement.virtualWorkforce.controlRoom'
  })
  .state('businessManagement.virtualWorkforce.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.configure.html',
    controller: 'businessManagement.virtualWorkforce.configure'
  })
  .state('businessManagement.virtualWorkforce.environments', {
    url: "/environments",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.environments.html',
    controller: 'businessManagement.virtualWorkforce.environments'
  })
  .state('businessManagement.virtualWorkforce.processes', {
    url: "/processes",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.processes.html',
    controller: 'businessManagement.virtualWorkforce.processes'
  })
  .state('businessManagement.virtualWorkforce.queues', {
    url: "/queues",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.queues.html',
    controller: 'businessManagement.virtualWorkforce.queues'
  })
  .state('businessManagement.virtualWorkforce.releases', {
    url: "/releases",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.releases.html',
    controller: 'businessManagement.virtualWorkforce.releases'
  })
  .state('businessManagement.virtualWorkforce.reports', {
    url: "/reports",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.reports.html',
    controller: 'businessManagement.virtualWorkforce.reports'
  })
  .state('businessManagement.virtualWorkforce.schedules', {
    url: "/schedules",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.schedules.html',
    controller: 'businessManagement.virtualWorkforce.schedules'
  })
  .state('businessManagement.virtualWorkforce.robots', {
    url: "/robots",
    templateUrl: '/static/ngTemplates/app.virtualWorkforce.robots.html',
    controller: 'businessManagement.virtualWorkforce.robots'
  })


});

app.controller('businessManagement.virtualWorkforce.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  var getState = function(input){
    parts = input.name.split('.');
    // console.log(parts);

    return input.name.replace('app' , 'businessManagement')
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 3 || parts.length != 3 || parts[1] != 'virtualWorkforce') {
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
      return  $state.is(app.name.replace('app' , 'businessManagement'))
    }
  }

});
