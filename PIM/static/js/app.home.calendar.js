app.controller("home.calendar", function($scope , $state) {

  $scope.date = new Date();
  $scope.items =
  [
    { type : 'type1 ' , data : 'data 1' , created : new Date() },

  ];
})
