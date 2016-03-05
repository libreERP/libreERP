
app.controller('businessManagement.ecommerce.earnings' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $http({method : 'GET' , url : '/api/ecommerce/earnings/'}).
  then(function(response) {
    $scope.data = response.data;
    $scope.compareLastWeek = Math.ceil(($scope.data.lastWeekEarnings-$scope.data.last2LastWeekEarnings)*100/$scope.data.last2LastWeekEarnings);
    $scope.compareCurrentWeek = Math.ceil(($scope.data.expectedThisWeek-$scope.data.lastWeekEarnings)*100/$scope.data.lastWeekEarnings);
    $scope.labels2 = ["Completed", "On Going", "Cancelled"];
    $scope.data2 = [$scope.data.completeThisWeek, $scope.data.inProgressOrders, $scope.data.cancelledThisWeek];
    $scope.labels = $scope.data.months;
    $scope.series = ['Month Wise Bookings'];
    $scope.data1 = [
      $scope.data.monthWiseBookings,
    ];
  });


  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

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
