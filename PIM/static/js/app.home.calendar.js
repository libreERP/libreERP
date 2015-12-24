app.controller("home.calendar", function($scope , $http ,$aside, $state , $timeout) {

  $scope.availableForms = [
    {name : 'Meeting'},
    {name : 'To Do'},
    {name : 'Reminder'},
  ];

  $scope.data = {items : []};
  $scope.meetings = [];
  $http({url : '/api/PIM/calendar/' , method : 'GET'}).
  then(function(response){
    $scope.meetings = response.data;
    for (var i = 0; i < $scope.meetings.length; i++) {
      $scope.data.items.push( {'type' : $scope.meetings[i].eventType, data : $scope.meetings[i] ,  date : new Date($scope.meetings[i].when)});
    }
  })

  $scope.showDay = function(input){
    $scope.itemsToShow = [];
    for (var i = 0; i < input.length; i++) {
      $scope.itemsToShow.push($scope.data.items[input[i]]);
    }
  };

  $scope.showPerticular = function(input){
    $scope.itemInView = $scope.itemsToShow[input];
  };

  $scope.openForm = function(form){
    if (form == 'Meeting') {
      templateUrl = '/static/ngTemplates/app.home.calendar.aside.html';
      template = '/static/ngTemplates/app.home.calendar.form.meeting.html';
      input = {formTitle : 'Create a meeting' , template : template , items : $scope.data.items};
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


})
app.controller('controller.home.calendar.aside.form', function($scope, $uibModalInstance , $http, userProfileService , input , Flash) {

  var emptyFile = new File([""], "");
  $scope.me = userProfileService.get("mySelf");
  $scope.data = input;

  $scope.saveMeeting = function(){

    var fd = new FormData();
    fd.append('eventType' , 'Meeting' );
    fd.append('text' , $scope.data.text );
    fd.append('user' , $scope.me.url);
    if ($scope.data.attachment !=emptyFile) {
      fd.append('attachment' , $scope.data.attachment);
    }
    if ( typeof $scope.data.with !='undefined' && $scope.data.with != '' ) {
      fd.append('tagged' , $scope.data.with)
    }
    if ($scope.data.when != '' ) {
      fd.append('when' , $scope.data.when );
    }
    if ($scope.data.venue != '' ) {
      fd.append('venue' , $scope.data.venue );
    }
    fd.append('level' , $scope.data.priority );
    var url = '/api/PIM/calendar/';
    $http({method : 'POST' , url : url, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
      $scope.resetMeeting();
    },function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.resetMeeting = function(){
    $scope.data.text = '';
    $scope.data.attachment = emptyFile;
    $scope.data.with = '';
    $scope.data.when = '';
    $scope.data.venue = '';
    $scope.data.priority = 'Normal';
  };
  $scope.resetMeeting();
})
