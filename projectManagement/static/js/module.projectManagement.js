app.config(function($stateProvider){

  $stateProvider
  .state('projectManagement', {
    url: "/projectManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/projectManagement.html',
       },
       "menu@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.menu.html',
          controller : 'projectManagement.menu'
        },
        "@projectManagement": {
          templateUrl: '/static/ngTemplates/projectManagement.dash.html',
          controller : 'projectManagement'
        }
    }
  })

});

app.controller('projectManagement' , function($scope , $users , Flash){
  // main businessManagement tab default page controller
});

app.controller('projectManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      var a = apps[i];
      var parts = a.name.split('.');
      if (a.module != 10 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'projectManagement')
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  var as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };
});
