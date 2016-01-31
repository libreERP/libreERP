app.controller('businessManagement.ecommerce.offerings.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){

  $scope.$watch('data.item' , function(newValue , oldValue){
    if (typeof $scope.data.item != 'number') {
      return;
    }
    $http({method : 'GET' , url : '/api/ecommerce/listing/' + $scope.data.item + '/' }).
    then(function (response) {
      $scope.data.item = response.data;
      $http({method : 'GET' , url : '/api/ecommerce/insight/?offering=' + $scope.data.pk}).
      then(function(response) {
        $scope.insight = response.data;
      })
    });
  })

});

app.directive('ecommerceOfferingEditor', function () {
  return {
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.form.offering.html',
    restrict: 'A',
    replace: true,
    scope: {
      configObj:'@',
    },
    controller : 'ecommerce.form.offering',
  };
});

app.controller('ecommerce.form.offering' , function($scope , $state , $stateParams , $http , Flash){
  $scope.data = {mode : 'select' , form : {} };
  $scope.config = JSON.parse($scope.configObj);

  if (angular.isDefined($scope.config.pk)) {
    $scope.pk = $scope.config.pk;
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
    if ($scope.editorMode == 'edit') {
      var post = {method : 'PATCH' , url : '/api/ecommerce/offeringAdmin/' + $scope.pk +'/'}

    }else {
      var post = {method : 'POST' , url : '/api/ecommerce/offeringAdmin/'}
      dataToSend.item = $scope.data.listing.pk;
    }
    $http({method : post.method , url : post.url , data : $scope.data.form}).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
      }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }

  if ($scope.editorMode == 'edit') {
    $http({method : 'GET' , url : '/api/ecommerce/offeringAdmin/' + $scope.pk +'/'}).
    then(function(response){
      $scope.data.form = response.data;
    })
  };
});

app.controller('businessManagement.ecommerce.offerings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.getConfig = function(mode , data){
    toReturn = {};
    toReturn[mode] = data
    return JSON.stringify(toReturn)
  }

  $scope.data = {mode : 'select' , form : {} };

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.offerings.item.html',
  },];

  var options = {main : {icon : 'fa-pencil', text: 'edit'} ,
    // others : [{icon : '' , text : 'social' },
      // {icon : '' , text : 'editMaster' },]
    };

  $scope.config = {
    url : '/api/ecommerce/offeringAdmin/',
    views : views,
    searchField : 'item',
    deletable : true,
    options : options,
  }

  $scope.goBack = function(){
    $scope.data.mode = 'select';
  }


  $scope.listingSearch = function(query) {
    return $http.get('/api/ecommerce/listing/?mode=vendor&title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  $scope.tableAction = function(target , action , mode){
    if (action=='edit') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Edit offering : ' + $scope.data.tableData[i].pk , cancel : true , app : 'editOffering' , data : {pk : target} , active : true})
        }
      }
    }
  }



})
