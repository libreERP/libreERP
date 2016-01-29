app.controller('businessManagement.ecommerce.orders.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){
  console.log($scope.data);
  $scope.bookingTime = function() {
    return Math.floor((new Date($scope.data.end)- new Date($scope.data.start))/3600000);
  }
  $scope.getBookingAmount = function(){
    h = $scope.bookingTime()
    if (h<0){
      return 0
    }else {
      return $scope.data.rate * $scope.data.quantity*h
    }
  }
  $http({method : 'GET' , url : '/api/ecommerce/offering/' + $scope.data.offer + '/'}).
  then(function (response) {
    $scope.data.offer = response.data;
    $http({method : 'GET' , url : '/api/ecommerce/listing/' + response.data.item + '/' }).
    then(function (response) {
      $scope.data.item = response.data;
      console.log($scope.data);
    })
  })
  console.log($scope.getBookingAmount());
})

app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){

  $scope.data = {tableData : []}

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.orders.item.html',
  },];
  var getParams = [{key : 'mode' , value : 'provider'}]

  var options = {main : {icon : 'fa-print', text: 'print invoice'} ,
    others : [
      {icon : 'fa-check' , text : 'markComplete' },
      {icon : '' , text : 'cancel' },
      // {icon : '' , text : 'sendMessage' },
      // {icon : '' , text : 'printAgreement' },
    ]
  };

  $scope.config = {
    views : views,
    getParams : getParams,
    url : '/api/ecommerce/order/',
    options : options,
    searchField : 'id',
    fields : ['user' , 'created' , 'rate' , 'status' , 'paymentType' , 'paid' , 'quantity' , 'start' , 'end']
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
    if (action == 'printInvoice') {
      $http.get('/api/ecommerce/printInvoice/?id=' + target ,'', {responseType:'arraybuffer'}).
      success((function(target){
        return function(response){
        var file = new Blob([response], { type: 'application/pdf' });
        var fileURL = URL.createObjectURL(file);
        content = $sce.trustAsResourceUrl(fileURL);
        $scope.addTab({title : 'Print Invocie for order ID : '+ target , cancel : true , app : 'print invoice' , data : {pk : target , content : content} , active : true})
        }
        })(target)
      )
    } else if (action == 'complete') {
      $http({method : 'PATCH' , url : '/api/ecommerce/order/'+target+'/?mode=provider', data : {status : 'complete'}})
    } else if (action == 'reject') {
      $http({method : 'PATCH' , url : '/api/ecommerce/order/'+target+'/?mode=provider', data : {status : 'canceledByVendor'}})
    }
  }


});
