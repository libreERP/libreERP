
app.controller('businessManagement.ecommerce.listings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  form = {mediaType : '' , files : [] , file : emptyFile , url : '',
    priceModel : 'quantity',
    category : 'product',
  }

  $scope.choiceSearch = function(query , field) {
    return $http.get('/api/ecommerce/choiceOption/?name__contains=' + query + '&parent=' + field.parentLabel).
    then(function(response){
      return response.data;
    })
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
    fields = $scope.data.genericProduct.fields;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].fieldType == 'boolean'){
        if (fields[i].default == 'true') {
          $scope.data.genericProduct.fields[i].default = true;
        } else {
          $scope.data.genericProduct.fields[i].default = false;
        }
      } else if (fields[i].fieldType == 'float') {
        $scope.data.genericProduct.fields[i].default = parseFloat(fields[i].default);
      } else if (fields[i].fieldType == 'date') {
        $scope.data.genericProduct.fields[i].default = new Date();
      } else if (fields[i].fieldType == 'choice') {
        $http({method : 'GET' , url : '/api/ecommerce/choiceLabel/?name=' + fields[i].unit}).
        then((function(i){
          return function(response){
            $scope.data.genericProduct.fields[i].parentLabel = response.data[0].pk;
          }
        })(i))
      }
    }
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
      toPush['fieldType'] = f.fieldType;
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
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
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
