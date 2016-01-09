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

});

app.controller('businessManagement.ecommerce.listings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){





});

app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

});

app.controller('businessManagement.ecommerce.earnings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

});

app.controller('businessManagement.ecommerce.admin' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.typeSearch = function(query) {
    return $http.get('/api/ecommerce/genericType/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  },

  $scope.getFieldsSuggestions = function(query){
    return $http.get('/api/ecommerce/field/?name__contains='+ query)
  }


  $scope.data = {mode : 'field'};
  $scope.submit = function(){
    console.log($scope.data);
    console.log($scope.data.mode);
    d = $scope.data;
    if ($scope.data.mode == 'field') {
      dataToSend = {
        type : d.type,
        name : d.name,
        unit : d.unit,
        helpText : d.helpText,
        default : d.default,
      };

      url = '/api/ecommerce/field/';
    } else if($scope.data.mode == 'genericType'){
      dataToSend = {
        name : d.name,
        icon : d.icon,
      };
      url = '/api/ecommerce/genericType/';
    } else if ($scope.data.mode == 'genericProduct') {
      fs = [];
      for (var i = 0; i < d.fields.length; i++) {
        fs.push(d.fields[i].pk);
      }
      console.log(fs);
      if (fs.length == 0) {
        Flash.create('danger' , 'No fields selected')
        return;
      }
      dataToSend = {
        name : d.name,
        productType : d.productType.pk,
        fields : fs,
      }
      url = '/api/ecommerce/genericProduct/';
    }

    $http({method : 'POST' , url : url , data : dataToSend}).
    then(function(response){
      $scope.data = {mode : $scope.data.mode}
      Flash.create('success', response.status + ' : ' + response.statusText );
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  }


});

app.controller('businessManagement.ecommerce.support' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

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
      if (a.module != 3 || parts.length != 3) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = [
    {name : 'app.ecommerce.listings' , module : 3 , icon : 'fa-list-alt'},
    {name : 'app.ecommerce.orders' , module : 3, icon : 'fa-shopping-bag'},
    {name : 'app.ecommerce.earnings' , module : 3, icon : 'fa-credit-card'},
    {name : 'app.ecommerce.admin' , module : 3, icon : 'fa-wrench'},
    {name : 'app.ecommerce.support' , module : 3, icon : 'fa-phone'},
  ];

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
