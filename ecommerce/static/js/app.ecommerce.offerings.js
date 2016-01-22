
app.controller('businessManagement.ecommerce.offerings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.data = {mode : 'select' , form : {} };

  $scope.resetForm = function(){
    $scope.data.form = {
      shippingOptions : 'pickup',
      availability : 'local',
      rate : null,
      freeReturns : false,
      replacementPeriod : null,
      shippingFee : null,
      inStock : null
    }
  }

  $scope.resetForm()

  $scope.listingSearch = function(query) {
    return $http.get('/api/ecommerce/listing/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.buildForm = function(){
    $scope.data.mode = 'create'
  }

  $scope.views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.submit = function() {
    dataToSend = $scope.data.form;
    dataToSend.item = $scope.data.listing.pk;
    $http({method : 'POST' , url : '/api/ecommerce/offeringAdmin/' , data : $scope.data.form}).
    then(function(response){
      $scope.resetForm();
      Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  $scope.goBack = function(){
    $scope.data.mode = 'select';
  }


})
