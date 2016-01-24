
app.controller('businessManagement.ecommerce.orders' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
    ];
  var getParams = [{key : 'mode' , value : 'provider'}]

  var options = {main : {icon : 'fa-print', text: 'print invoice'} ,
    others : [
      {icon : 'fa-check' , text : 'markComplete' },
      {icon : '' , text : 'cancel' },
      {icon : '' , text : 'sendMessage' },
      {icon : '' , text : 'printAgreement' },
    ]
  };

  $scope.config = {
    views : views,
    getParams : getParams,
    url : '/api/ecommerce/order/',
    options : options,
    searchField : 'id',
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target);
    console.log(action);
    var doc = new jsPDF();
    doc.fromHTML($('#pdf').get(0), 15, 15, {
    	'width': 170,
    });
    doc.save('pdf.pdf')
  }


});
