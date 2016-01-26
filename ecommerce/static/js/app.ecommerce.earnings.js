
app.controller('businessManagement.ecommerce.earnings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data2 = [300, 500, 100];

  $scope.labels3 =["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"];

  $scope.data3 = [
    [65, 59, 90, 81, 56, 55, 40],
    [28, 48, 40, 19, 96, 27, 100]
  ];

  $scope.seriesLabel3 = ['earnings' , 'boolings']


  $scope.labels4 = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  $scope.series4 = ['Series A', 'Series B'];

  $scope.data4 = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];




});
