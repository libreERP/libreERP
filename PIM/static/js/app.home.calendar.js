app.controller("home.calendar", function($scope , $state) {

  $scope.availableForms = [
    {name : 'Meeting'},
    {name : 'To Do'},
    {name : 'Reminder'},
  ];

  $scope.selected = undefined;


  $scope.date = new Date();
  $scope.templates = '/static/ngTemplates/app.home.calendar.items.html';
  $scope.items =
  [
    { type : 'type1 ' , data : 'data 1' , date : new Date() },
    { type : 'type3 ' , data : 'data 1' , date : new Date('2015-12-12') },
    { type : 'type3 ' , data : 'data 1' , date : new Date('2015-11-30') },
    { type : 'type3 ' , data : 'data 1' , date : new Date('2015-11-30') },
    { type : 'type5 ' , data : 'data 1' , date : new Date('2015-12-22') },
    { type : 'type6 ' , data : 'data 1' , date : new Date('2015-12-02') },
  ];
})
