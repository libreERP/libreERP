app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement', {
    url: "/businessManagement",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/businessManagement.html',
       },
       "menu@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.menu.html',
          controller : 'businessManagement.menu'
        },
        "@businessManagement": {
          templateUrl: '/static/ngTemplates/businessManagement.dash.html',
          controller : 'businessManagement'
        }
    }
  })

});

app.controller('businessManagement' , function($scope , $users , Flash){
  // main businessManagement tab default page controller
});

app.controller('businessManagement.menu' , function($scope , $users , Flash , $permissions){
  // main businessManagement tab default page controller

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 3 || a.name.indexOf('app') == -1 || parts.length != 2) {
        continue;
      }
      a.state = a.name.replace('app' , 'businessManagement')
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };
});
