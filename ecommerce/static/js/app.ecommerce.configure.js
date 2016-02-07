app.controller('businessManagement.ecommerce.configure.offerBanner' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.form = {image : emptyFile};

  if (angular.isUndefined($scope.data.pk)) {
    $scope.mode = 'new';
    $scope.data = {title : '' , subtitle : '' , level : 1 , state : '' , params : ''};
    $scope.url =  '/api/ecommerce/offerBanner/';
    $scope.method = 'POST';
  }else {
    $scope.mdoe = 'edit';
    $scope.url =  '/api/ecommerce/offerBanner/' + $scope.data.pk + '/';
    $scope.method = 'PATCH';
  }

  $scope.submit = function() {
    var fd = new FormData();
    fd.append( 'title' , $scope.data.title);
    fd.append( 'subtitle' , $scope.data.subtitle);
    fd.append( 'level' , $scope.data.level);
    fd.append( 'state' , $scope.data.state);
    fd.append( 'params' , $scope.data.params);
    if ($scope.mode == 'new') {
      if ($scope.form.image == emptyFile) {
        Flash.create('danger', 'No image selected');
        return;
      }else {
        fd.append( 'image' , $scope.form.image);
      }
    }else {
      if ($scope.form.image != emptyFile) {
        fd.append( 'image' , $scope.form.image);
      }
    }
    $http({method : $scope.method , url : $scope.url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      if ($scope.mode == 'new') {
        $scope.data = {title : '' , subtitle : '' , image : emptyFile , level : 1 , state : '' , params : ''};
      }
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }



});
app.controller('businessManagement.ecommerce.configure' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.editorTemplateField = '/static/ngTemplates/app.ecommerce.vendor.form.field.html';
  $scope.editorTemplateChoiceLabel = '/static/ngTemplates/app.ecommerce.vendor.form.choiceLabel.html';
  $scope.editorTemplateChoiceOption = '/static/ngTemplates/app.ecommerce.vendor.form.choiceOption.html';
  $scope.editorTemplateGenericProduct = '/static/ngTemplates/app.ecommerce.vendor.form.genericProduct.html';
  $scope.editorTemplateGenericType = '/static/ngTemplates/app.ecommerce.vendor.form.genericType.html';

  $scope.fieldConfig = {
    views : views,
    url : '/api/ecommerce/field/',
    fields : ['pk','fieldType','unit' , 'name' , 'default' , 'helpText'],
    searchField: 'name',
    deletable : true,
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.modal.html',
  }
  $scope.genericTypeConfig = {
    views : views,
    url : '/api/ecommerce/genericType/',
    fields : ['pk', 'name' , 'icon' ],
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.modal.html',
    deletable : true,
    searchField: 'name',
  }

  $scope.genericProductConfig = {
    views : views,
    url : '/api/ecommerce/genericProduct/',
    fields : ['pk', 'name' , 'productType' ],
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.modal.html',
    deletable : true,
    searchField: 'name',
  }

  $scope.choiceLabelConfig = {
    views : views,
    url : '/api/ecommerce/choiceLabel/',
    fields : ['pk', 'name' , 'icon' ],
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.modal.html',
    deletable : true,
    searchField: 'name',
  }

  $scope.choiceOptionConfig = {
    views : views,
    url : '/api/ecommerce/choiceOption/',
    fields : ['pk', 'name' , 'icon', 'parent' ],
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.modal.html',
    deletable : true,
    searchField: 'name',
  }
  $scope.offerBannersConfig = {
    views : views,
    url : '/api/ecommerce/offerBanner/',
    deletable : true,
    searchField: 'name',
    canCreate : true,
    editorTemplate : '/static/ngTemplates/app.ecommerce.vendor.form.offerBanner.html',
  }


  $scope.typeSearch = function(query) {
    return $http.get('/api/ecommerce/genericType/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  }

  $scope.getFieldsSuggestions = function(query){
    return $http.get('/api/ecommerce/field/?name__contains='+ query)
  }

  $scope.parentLabelSearch = function(query) {
    return $http.get('/api/ecommerce/choiceLabel/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  }

  if (angular.isUndefined($scope.data)) { // we are creating new entry
    $scope.data = {mode : 'field' , fieldType : 'char'};
    $scope.editing = false;
  } else { // editing
    $scope.editing = true;
    $scope.config = $scope.$parent.config;
    $scope.backup = angular.copy($scope.data);
    $scope.data.mode = $scope.config.url.split('/')[3];
    if ($scope.data.mode == 'choiceOption' && !angular.isDefined($scope.data.parentLabel)) {
      $http({method : 'GET' , url : '/api/ecommerce/choiceLabel/' + $scope.data.parent + '/'}).
      then(function(response) {
        $scope.data.parentLabel = response.data;
      });
    } else if ($scope.data.mode == 'field' && $scope.data.fieldType == 'choice') {
      $http({method : 'GET' , url : '/api/ecommerce/choiceLabel/?name=' + $scope.data.unit}).
      then(function(response) {
        $scope.data.choiceLabel = response.data[0];
      });
    }
  }


  $scope.submit = function(){
    d = $scope.data;
    if ($scope.data.mode == 'field') {
      dataToSend = {
        fieldType : d.fieldType,
        name : d.name,
        helpText : d.helpText,
        default : d.default,
      };
      if (d.fieldType == 'choice') {
        dataToSend.unit = d.choiceLabel.name;
      }else {
        dataToSend.unit = d.unit;
      }

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
    } else if ($scope.data.mode == 'choiceLabel') {
      dataToSend = {
        name : $scope.data.name,
        icon : $scope.data.icon,
      }
      url = '/api/ecommerce/choiceLabel/';
    } else if ($scope.data.mode == 'choiceOption') {
      dataToSend = {
        name : $scope.data.name,
        parent : $scope.data.parentLabel.pk,
        icon : $scope.data.icon,
      }
      url = '/api/ecommerce/choiceOption/';
    }

    if ($scope.editing) {
      url += $scope.data.pk + '/';
      method = 'PATCH';
    } else {
      method = 'POST';
    }

    $http({method : method , url : url , data : dataToSend}).
    then(function(response){
      if (!$scope.editing) {
        $scope.data = {mode : $scope.data.mode , type : 'char', parentLabel : $scope.data.parentLabel}
      }
      Flash.create('success', response.status + ' : ' + response.statusText );
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  }


});
