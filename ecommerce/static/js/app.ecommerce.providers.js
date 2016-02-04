app.controller('businessManagement.ecommerce.providers.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions , $sce){

});


app.controller('businessManagement.ecommerce.providers' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.ecommerce.vendor.providers.item.html',
  },];

  $scope.data = {tableData : {}};

  $scope.config = {
    views : views,
    url : '/api/ecommerce/service/',
    fields : ['pk','name','cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo'],
    searchField: 'name',
    // deletable : true,
  }

});
