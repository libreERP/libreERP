app.controller('controller.ecommerce.account.cart' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){
  $window.scrollTo(0,0)
  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.account.cart.item.html',
  },];

  $scope.cartConfig = {
    views : views,
    url : '/api/ecommerce/saved/',
    // fields : ['pk','fieldType','unit' , 'name' , 'default' , 'helpText'],
    // searchField: 'title',
  }
});

app.controller('controller.ecommerce.account.cart.item' , function($scope , $http , $state){

  $scope.tableData = $scope.$parent.$parent.$parent.$parent.$parent.data;
  $scope.data = $scope.$parent.$parent.data;
  $scope.delete = $scope.$parent.$parent.delete;

  $scope.delete = function(){
    $http({method : 'DELETE' , url : '/api/ecommerce/saved/' +  $scope.data.id + '/'}).
    then(function(response) {
      for (var i = 0; i < $scope.tableData.length; i++) {
        if ($scope.tableData[i].id == $scope.data.id){
          $scope.tableData.splice(i,1);
          $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.inCart.splice(0,1);
        }
      }
    });
  }
  $http({method : 'GET' , url : '/api/ecommerce/listingLite/' + $scope.data.item + '/'}).
  then(function(response){
    index = 0
    l = response.data;
    min = l.providerOptions[index].rate;
    for (var j = 1; j < l.providerOptions.length; j++) {
      if (l.providerOptions[j].rate < min) {
        min = l.providerOptions[j].rate;
        index = j;
      }
    }
    l.bestOffer = l.providerOptions[index];
    for(key in l){
      $scope.data[key] = l[key];
    }
  })

  $scope.view = function(){
    $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.data.pickUpTime = $scope.data.start;
    $scope.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.data.dropInTime = $scope.data.end;
    $state.go('details' , {id : $scope.data.pk});
  }


})

app.controller('controller.ecommerce.account.orders' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/tableDefault.html' ,
  },];

  $scope.orderConfig = {
    views : views,
    url : '/api/ecommerce/order/',
    getParams : [{key : 'mode', value : 'consumer'}],
    fields : ['pk','created','rate' , 'address' , 'start' , 'end' , 'paymentType'],
    searchField: 'name',
  }

});

app.controller('controller.ecommerce.account.settings' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){
  $scope.form = {address : { street : '' , pincode : '' , city : '' , state : '', mobile :'' }}

  $http({method : 'GET' , url : '/api/ecommerce/profile/'}).
  then(function(response){
    // for(key in response.data[0])
    $scope.customerProfile = response.data[0];
    $scope.form.address = response.data[0].address;
    console.log($scope.customerProfile);
  })


  $scope.saveAddress = function(){
    dataToSend = $scope.form.address;
    dataToSend.sendUpdates  = $scope.customerProfile.sendUpdates;
    dataToSend.mobile  = $scope.customerProfile.mobile;
    $http({method : 'PATCH' , url : '/api/ecommerce/profile/' + $scope.customerProfile.pk + '/' , data : dataToSend }).
    then(function(response){
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }

});

app.controller('controller.ecommerce.account.support' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

  $scope.message = {subject : '' , body : ''};
  $scope.sendMessage = function(){
    $http({method : 'POST' , url : '/api/ecommerce/support/' , data : $scope.message}).
    then(function(response){
      $scope.message = {subject : '' , body : ''};
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response){
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })
  }


});

app.controller('controller.ecommerce.account' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash , $window){
  $window.scrollTo(0,0)
});
