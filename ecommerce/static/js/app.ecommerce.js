app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.ecommerce', {
    url: "/ecommerce",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.ecommerce.vendor.html',
       },
       "menu@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/app.ecommerce.vendor.menu.html',
          controller : 'businessManagement.ecommerce.menu',
        },
        "@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/app.ecommerce.vendor.default.html',
        }
    }
  })

  .state('businessManagement.ecommerce.listings', {
    url: "/listings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.listings.html',
    controller: 'businessManagement.ecommerce.listings'
  })

  .state('businessManagement.ecommerce.orders', {
    url: "/orders",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.orders.html',
    controller: 'businessManagement.ecommerce.orders'
  })

  .state('businessManagement.ecommerce.earnings', {
    url: "/earnings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.earnings.html',
    controller: 'businessManagement.ecommerce.earnings'
  })
  .state('businessManagement.ecommerce.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.support.html',
    controller: 'businessManagement.ecommerce.support'
  })
  .state('businessManagement.ecommerce.admin', {
    url: "/admin",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.admin.html',
    controller: 'businessManagement.ecommerce.admin'
  })
  .state('businessManagement.ecommerce.offerings', {
    url: "/offerings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.offerings.html',
    controller: 'businessManagement.ecommerce.offerings'
  })

});

app.controller('businessManagement.ecommerce.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
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
      if (a.module != 3 || parts.length != 3 || parts[1] != 'ecommerce') {
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
