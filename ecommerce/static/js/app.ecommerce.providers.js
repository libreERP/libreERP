app.controller('businessManagement.ecommerce.providers' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];

  $scope.data = {tableData : {}};

  $scope.config = {
    views : views,
    url : '/api/ecommerce/service/',
    fields : ['pk','name','cin' , 'tin' , 'address' , 'mobile' , 'telephone' , 'logo'],
    searchField: 'name',
    // deletable : true,
  }

});
