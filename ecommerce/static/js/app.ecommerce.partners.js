app.controller('businessManagement.ecommerce.partners.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){

  $scope.$watch('data.user', function(newValue , oldValue) {
    if (typeof $scope.data.user != 'object') {
      $http({method : 'GET' , url : '/api/HR/users/' + $scope.data.user + '/'}).
      then(function(response) {
        $scope.data.user = response.data;
      })
    }
  })




});

app.controller('controller.ecommerce.priceModel' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.name = 'sagar'

  $scope.form = {weeklyDiscount  : 0 , perday  : 0 , monthlyDiscount : 0 , weekend : 0}

  $scope.submit = function() {

    if ($scope.form.weeklyDiscount < 0) {
      Flash.create('danger' , 'Negative input is not accepted')
      return;
    }


    $http({method : 'POST' , url : '/api/ecommerce/price/' , data : $scope.form}).
    then(function(response) {
      $scope.newPrice = response.data;
      Flash.create('success' , 'Yes')
    }, function(response) {
      Flash.create('danger' , 'Ouch , an error occured')
    })

  }








})

app.controller('businessManagement.ecommerce.partners' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.partners.item.html',
  },];

  $scope.data = {tableData : {}};

  $scope.config = {
    views : views,
    url : '/api/ecommerce/service/',
    fields : ['pk','name','cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo'],
    searchField: 'name',
    itemsNumPerView : [6,12,24],
    // deletable : true,
  }

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
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].id == parseInt(target)){
        index = i;
        break;
      }
    }
    // index is the index of the object in the table in the view and target is either the id or Pk of the object
    if (action == 'showDetails') {
      $scope.addTab({title : 'Print Invocie for order ID : '+ target , cancel : true , app : 'showDetails' , data : {pk : target } , active : true})
    }
  }

});
