app.controller("home.calendar", function($scope , $http ,$aside, $state , $timeout) {

  $scope.data = {items : []};
  $http({url : '/api/PIM/calendar/' , method : 'GET'}).
  then(function(response){
    d = response.data;
    for (var i = 0; i < d.length; i++) {
      $scope.data.items.push( {'type' : d[i].eventType, data : d[i] ,  date : new Date(d[i].when)});
    }
  })

  $scope.showDay = function(input){
    $scope.itemsToShow = [];
    for (var i = 0; i < input.length; i++) {
      $scope.itemsToShow.push($scope.data.items[input[i]]);
    }
    $scope.itemInView = $scope.data.items[input[0]];
  };

  $scope.itemSelected = function(input){
    $scope.itemInView = $scope.itemsToShow[input];
  }

  $scope.toggleToDo = function(input){
    todo = $scope.data.items[input].data;
    $http({url : todo.url , method : 'PATCH' , data : {completed : todo.completed}})
  }
  $scope.deleteToDo = function(input){
    todo = $scope.data.items[input].data;
    $http({url : todo.url , method : 'DELETE' })
    $scope.data.items.splice(input , 1);
  }

  $scope.showPerticular = function(input){
    $scope.itemInView = $scope.data.items[input];
  };

  $scope.openForm = function(){

    templateUrl = '/static/ngTemplates/app.home.calendar.aside.html';
    templates = {
      meeting : '/static/ngTemplates/app.home.calendar.form.meeting.html' ,
      reminder : '/static/ngTemplates/app.home.calendar.form.reminder.html' ,
      todo : '/static/ngTemplates/app.home.calendar.form.todo.html'
    };
    input = {formTitle : 'Create an item' , template : templates , items : $scope.data.items};
    position = 'left';
    $scope.openAside(position, input , templateUrl);
  }

  $scope.openAside = function( position , input , templateUrl) {
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
      controller:'controller.home.calendar.aside',
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
app.controller('controller.home.calendar.aside', function($scope, $uibModalInstance , $http, userProfileService , input , Flash) {
  $scope.baseUrl = '/api/PIM/calendar/';

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
    if ($scope.data.venue != '' ) {
      fd.append('duration' , parseInt($scope.data.duration*60) );
    }
    fd.append('level' , $scope.data.priority );

    $http({method : 'POST' , url : $scope.baseUrl, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
      $scope.resetForm();
    },function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.saveReminder = function(){
    data = { eventType : 'Reminder', user : $scope.me.url , text : $scope.data.text , when : $scope.data.when  };
    $http({method : 'POST' , url : $scope.baseUrl , data : data}).
    then(function(response){
      $scope.resetForm()
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
    } , function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.saveToDo = function(){
    data = { eventType : 'ToDo', user : $scope.me.url , text : $scope.data.text  };
    $http({method : 'POST' , url : $scope.baseUrl , data : data}).
    then(function(response){
      $scope.resetForm()
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
    } , function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.resetForm = function(){
    $scope.data.text = '';
    $scope.data.attachment = emptyFile;
    $scope.data.with = '';
    $scope.data.when = '';
    $scope.data.venue = '';
    $scope.data.priority = 'Normal';
    $scope.data.duration = '';
  };
  $scope.resetForm();
})
