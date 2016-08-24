app.controller('businessManagement.ecommerce.support' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/ecommerce/feedback/',
    // fields : ['pk','title' , 'description' , 'priceModel' , 'approved' , 'category' , 'parentType'],
    searchField: 'mobile',
    // options : options,
    // deletable : true,
    itemsNumPerView : [12,24,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);
    if (action=='edit') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Edit Listing : ' + $scope.data.tableData[i].title , cancel : true , app : 'editListing' , data : {pk : target} , active : true})
        }
      }
    }
  }


});
