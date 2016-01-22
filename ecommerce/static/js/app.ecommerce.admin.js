
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

  $scope.parentLabelSearch = function(query) {
    return $http.get('/api/ecommerce/choiceLabel/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  }

  $scope.data = {mode : 'field'};
  $scope.submit = function(){
    console.log($scope.data.mode);
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
    console.log(url);

    $http({method : 'POST' , url : url , data : dataToSend}).
    then(function(response){
      $scope.data = {mode : $scope.data.mode , type : 'char', parentLabel : $scope.data.parentLabel}
      Flash.create('success', response.status + ' : ' + response.statusText );
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText );
    })
  }


});
