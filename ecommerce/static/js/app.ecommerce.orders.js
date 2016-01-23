
app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];
  var getParams = [{key : 'mode' , value : 'provider'}]

  var options = {main : {icon : 'fa-envelope-o', text: 'im'} ,
    others : [{icon : '' , text : 'social' },
      {icon : '' , text : 'editMaster' },]
    };

  $scope.config = {
    views : views,
    getParams : getParams,
    url : '/api/ecommerce/order/',
    options : options,
  }

  $scope.tableAction = function(target , action , mode){
    console.log("target");
  }
});
