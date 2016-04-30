app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement.taskBoard', {
    url: "/taskBoard",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.taskBoard.html',
       },
       "menu@projectManagement.taskBoard": {
          templateUrl: '/static/ngTemplates/app.taskBoard.menu.html',
          controller : 'projectManagement.taskBoard.menu',
        },
        "@projectManagement.taskBoard": {
          templateUrl: '/static/ngTemplates/app.taskBoard.default.html',
          controller : 'projectManagement.taskBoard.default',
        }
    }
  })
  .state('projectManagement.taskBoard.createTask', {
    url: "/createTask",
    templateUrl: '/static/ngTemplates/app.taskBoard.createTask.html',
    controller: 'projectManagement.taskBoard.createTask'
  })


});

app.controller('projectManagement.taskBoard.default' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){


});


app.controller('projectManagement.taskBoard.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
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
      if (a.module != 10 || parts.length != 3 || parts[1] != 'taskBoard') {
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
