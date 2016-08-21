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
