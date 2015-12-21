app.controller("home.calendar", function($scope ,$aside, $state , $timeout) {

  $scope.availableForms = [
    {name : 'Meeting'},
    {name : 'To Do'},
    {name : 'Reminder'},
  ];

  $scope.selected = undefined;

  $scope.openForm = function(form){
    if (form == 'Meeting') {
      templateUrl = '/static/ngTemplates/app.home.calendar.aside.html';
      template = '/static/ngTemplates/app.home.calendar.form.meeting.html';
      input = {formTitle : 'Create a meeting' , template : template};
      position = 'left';
    }
    $scope.formAside(position, input , templateUrl);

  }

  $scope.formAside = function( position , input , templateUrl) {
    $scope.asideState = {
      open: true,
      position: position
    };

    function postClose() {
      $scope.asideState.open = false;
    }

    $aside.open({
      templateUrl: templateUrl,
      placement: position,
      size: 'md',
      backdrop: true,
      controller:'controller.home.calendar.aside.form',
      resolve: {
       input: function () {
         return input;
        }
      }
    }).result.then(postClose, postClose);
  }


  $scope.hideAvailableOptions = function(){
    $timeout(function(){
      $scope.a = false;
    } , 500)
  };

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
app.controller('controller.home.calendar.aside.form', function($scope, $uibModalInstance , $http, userProfileService , input) {
  var emptyFile = new File([""], "");
  $scope.me = userProfileService.get("mySelf");
  $scope.data = input;





})
