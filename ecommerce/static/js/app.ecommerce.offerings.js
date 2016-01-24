app.directive('ecommerceOfferingEditor', function () {
  return {
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.form.offering.html',
    restrict: 'A',
    replace: true,
    scope: {
      configObj:'@',
    },
    controller : 'ecommerce.form.listing',
  };
});

app.controller('ecommerce.form.listing' , function($scope , $state , $stateParams , $http , Flash){
  $scope.data = {mode : 'select' , form : {} };
  $scope.config = JSON.parse($scope.configObj);

  if (angular.isDefined($scope.config.pk)) {
    $scope.id = $scope.config.pk;
    $scope.editorMode = 'edit';
  }else {
    $scope.editorMode = 'new';
    $scope.data.listing = $scope.config.parent;
  }

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

});
app.controller('businessManagement.ecommerce.offerings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.getConfig = function(mode , data){
    toReturn = {};
    toReturn[mode] = data
    return JSON.stringify(toReturn)
  }

  $scope.data = {mode : 'select' , form : {} };

  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.config = {
    url : '/api/ecommerce/offeringAdmin/',
    views : views,
    searchField : 'item',
  }

  $scope.goBack = function(){
    $scope.data.mode = 'select';
  }


  $scope.listingSearch = function(query) {
    return $http.get('/api/ecommerce/listing/?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };


})
