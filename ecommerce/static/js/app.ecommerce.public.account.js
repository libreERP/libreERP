app.controller('controller.ecommerce.account.cart' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

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
  console.log("item loaded");

  $scope.data = $scope.$parent.$parent.data;
  console.log($scope.data);
  $http({method : 'GET' , url : '/api/ecommerce/listing/' + $scope.data.item + '/'}).
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
    $state.go('details' , {id : $scope.data.pk})
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
    console.log($scope.form);
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

app.controller('controller.ecommerce.account' , function($scope , $state , $http , $timeout , $uibModal , $users , Flash){

});
