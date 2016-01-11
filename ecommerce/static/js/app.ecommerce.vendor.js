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

  form = {mediaType : '' , files : [] , file : emptyFile , url : '',
    availability : 'local',
    priceModel : 'quantity',
    shippingOptions : 'pickup',
    category : 'product',
  }

  $scope.data = {mode : 'select' , form : form };

  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  // $scope.options = {main : {icon : 'fa-envelope-o', text: 'im'} ,
  //   others : [{icon : '' , text : 'social' },
  //     // {icon : '' , text : 'learning' },
  //     // {icon : '' , text : 'leaveManagement' },
  //     {icon : '' , text : 'editProfile' },
  //     {icon : '' , text : 'editDesignation' },
  //     {icon : '' , text : 'editPermissions' },
  //     {icon : '' , text : 'editMaster' },]
  //   };




  $scope.genericProductSearch = function(query) {
    return $http.get('/api/ecommerce/genericProduct/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.buildForm = function(){
    $scope.data.mode = 'create'
    console.log($scope.data.genericProduct);
  }

  $scope.goBack = function(){
    $scope.data.mode = 'select';
  }

  $scope.switchMediaMode = function(mode){
    $scope.data.form.mediaType = mode;

  }

  $scope.submitListing = function(){
    form = $scope.data.form;
    dataToSend = {}
    for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
      f = $scope.data.genericProduct.fields[i];
      dataToSend[f.name] = f.default;
    }
    files = [];
    for (var i = 0; i < form.files.length; i++) {
      files.push(form.files[i].pk);
    }
    if (files.length != 0) {
      dataToSend.files = files;
    }
    for (key in form) {
      if (key != 'files' && key !='file') {
        if (key == 'replacementPeriod') {
          dataToSend[key] = parseInt(form[key]);
          continue;
        }
        dataToSend[key] = form[key];
      }
    }
    specs = [];
    for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
      f = $scope.data.genericProduct.fields[i];
      toPush = {};
      toPush['name'] = f.name;
      toPush['value'] = f.default;
      toPush['fieldType'] = f.default;
      toPush['unit'] = f.unit;
      specs.push(toPush);
    }
    dataToSend.specifications = JSON.stringify(specs)
    dataToSend.parentType = $scope.data.genericProduct.pk;
    $http({method : 'POST' , url : '/api/ecommerce/listing/' , data : dataToSend}).
    then(function(response){
      $scope.data.form.files = [];
      $scope.data.form.file = emptyFile;
      $scope.data.form = {mediaType : '' , files : [] , file : emptyFile , url : '',
        availability : 'local',
        priceModel : 'quantity',
        shippingOptions : 'pickup',
        category : 'product',
      }
      for (var i = 0; i < $scope.data.genericProduct.fields.length; i++) {
        $scope.data.genericProduct.fields[i].default = '';
      }
    })


  }



  $scope.postMedia = function(){
    var fd = new FormData();
    fd.append( 'mediaType' , $scope.data.form.mediaType);
    fd.append( 'link' , $scope.data.form.url);

    if (['doc' , 'image' , 'video'].indexOf($scope.data.form.mediaType) != -1 && $scope.data.form.file != emptyFile) {
      fd.append( 'attachment' ,$scope.data.form.file);
    }else if ($scope.data.form.url == '') {
      return;
    }

    url = '/api/ecommerce/media/';

    $http({method : 'POST' , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.data.form.files.push(response.data);
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });

  }


});

app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];
});

app.controller('businessManagement.ecommerce.earnings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

});

app.controller('businessManagement.ecommerce.admin' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.typeSearch = function(query) {
    return $http.get('/api/ecommerce/genericType/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  }

  $scope.getFieldsSuggestions = function(query){
    return $http.get('/api/ecommerce/field/?name__contains='+ query)
  }


  $scope.data = {mode : 'field'};
  $scope.submit = function(){
    d = $scope.data;
    if ($scope.data.mode == 'field') {
      dataToSend = {
        fieldType : d.type,
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
      $scope.data = {mode : $scope.data.mode , type : 'char'}
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
