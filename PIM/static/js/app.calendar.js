app.controller("controller.home.calendar", function($scope , $http ,$aside, $state , $timeout) {

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

  $scope.edit = function(){
    $scope.openForm($scope.data.items.indexOf($scope.itemInView));
  }
  $scope.delete = function(){
    $http({method : 'DELETE' , url : $scope.itemInView.data.url}).
    then(function(response){
      $scope.data.items.splice($scope.data.items.indexOf($scope.itemInView) , 1);
    })
  }

  $scope.openForm = function(index){
    // index is the index of the calendar item to be edited , if its undefined then a new object will be created else edited
    templateUrl = '/static/ngTemplates/app.home.calendar.aside.html';
    templates = {
      meeting : '/static/ngTemplates/app.home.calendar.form.meeting.html' ,
      reminder : '/static/ngTemplates/app.home.calendar.form.reminder.html' ,
      todo : '/static/ngTemplates/app.home.calendar.form.todo.html'
    };
    input = {formTitle : typeof index == 'undefined'? 'Create' : 'Edit' , template : templates , items : $scope.data.items , editor: index};
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

  $scope.date = new Date();
  $scope.templates = '/static/ngTemplates/app.home.calendar.items.html';

})
app.controller('controller.home.calendar.aside', function($scope, $uibModalInstance , $http, $users , input , Flash ,$filter) {
  $scope.baseUrl = '/api/PIM/calendar/';

  $scope.loadTags = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query)
  };


  var emptyFile = new File([""], "");
  $scope.me = $users.get("mySelf");
  $scope.data = input;

  $scope.saveMeeting = function(){

    var fd = new FormData();
    fd.append('eventType' , 'Meeting' );
    fd.append('text' , $scope.data.text );
    fd.append('user' , $scope.me.url );
    if ($scope.data.attachment !=emptyFile && $scope.data.attachment != null) {
      fd.append('attachment' , $scope.data.attachment);
    }
    if ( typeof $scope.data.with !='undefined' && $scope.data.with.length != 0 ) {
      withStr = '';
      for (var i = 0; i < $scope.data.with.length; i++) {
        withStr += $scope.data.with[i].username;
        if (i != $scope.data.with.length-1) {
          withStr += ','
        }
      }
      fd.append('with' , withStr)
    }
    if ($scope.data.when != '' ) {
      fd.append('when' , $filter('date')($scope.data.when , "yyyy-MM-dd'T'HH:mm:ssZ") );
    }
    if ($scope.data.venue != '' ) {
      fd.append('venue' , $scope.data.venue );
    }
    if ($scope.data.venue != '' ) {
      fd.append('duration' , parseInt($scope.data.duration*60) );
    }
    fd.append('level' , $scope.data.level );

    if ($scope.editMode) {
      url = $scope.data.items[$scope.data.editor].data.url;
      method = 'PATCH';
    } else {
      method = 'POST';
      url  = $scope.baseUrl;
    }

    $http({method : method , url : url, data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response){
      $scope.resetForm();
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.$$postDigest(function(){
        $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
      })
      if($scope.editMode) {
        for (var i = 0; i < $scope.data.items.length; i++) {
          if ($scope.data.items[i].data.url.cleanUrl() == response.data.url.cleanUrl()){
            $scope.data.items.splice(i, 1);
            return;
          }
        }
      }
    },function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.saveReminder = function(){
    if ($scope.editMode) {
      url = $scope.data.items[$scope.data.editor].data.url;
      method = 'PATCH';
    } else {
      method = 'POST';
      url  = $scope.baseUrl;
    }


    data = { eventType : 'Reminder', user : $scope.me.url , text : $scope.data.text , when : $filter('date')($scope.data.when , "yyyy-MM-dd'T'HH:mm:ssZ")  };
    $http({method : method , url : url , data : data}).
    then(function(response){
      $scope.resetForm();
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.$$postDigest(function(){
        $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
      })
      if($scope.editMode) {
        for (var i = 0; i < $scope.data.items.length; i++) {
          if ($scope.data.items[i].data.url.cleanUrl() == response.data.url.cleanUrl()){
            $scope.data.items.splice(i, 1);
            return;
          }
        }
      }
    } , function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.saveToDo = function(){
    if ($scope.editMode) {
      url = $scope.data.items[$scope.data.editor].data.url;
      method = 'PATCH';
    } else {
      method = 'POST';
      url  = $scope.baseUrl;
    }

    data = { eventType : 'ToDo', user : $scope.me.url , text : $scope.data.text  };
    $http({method : method , url : url , data : data}).
    then(function(response){
      Flash.create('success' , response.status + ' : ' + response.statusText);
      $scope.resetForm();
      $scope.$$postDigest(function(){
        $scope.data.items.push( {'type' : response.data.eventType, data : response.data ,  date : new Date(response.data.when)});
      })
      if($scope.editMode) {
        for (var i = 0; i < $scope.data.items.length; i++) {
          if ($scope.data.items[i].data.url.cleanUrl() == response.data.url.cleanUrl()){
            $scope.data.items.splice(i, 1);
            return;
          }
        }
      }
    } , function(response){
      Flash.create('danger' , response.status + ' : ' + response.statusText);
    });
  };

  $scope.resetForm = function(){
    $scope.data.text = '';
    $scope.data.attachment = emptyFile;
    $scope.data.with = '';
    $scope.data.when = new Date();
    $scope.data.venue = '';
    $scope.data.level = 'Normal';
    $scope.data.duration = '';
  };

  $scope.editMode = false;
  if (typeof $scope.data.editor == 'undefined') {
    $scope.resetForm();
  } else {
    $scope.editMode = true;
    calObj = $scope.data.items[$scope.data.editor].data;

    for (key in calObj){
      if (key == 'when') {
        $scope.data.when = new Date(calObj[key]);
      } else if (key == 'followers') {
        $scope.data.with = [];
        for (var i = 0; i < calObj[key].length; i++) {
          $scope.data.with.push({username : $users.get(calObj.followers[i]).username })
        }
      } else if (key == 'duration') {
        $scope.data[key] = calObj[key]/60;
      } else {
        $scope.data[key] = calObj[key];
      }
    }
    itemType = $scope.data.items[$scope.data.editor].type;
    if ( itemType == 'Meeting') {
      $scope.editorTemplate = $scope.data.template.meeting;
    } else if (itemType == 'ToDo') {
      $scope.editorTemplate = $scope.data.template.todo;
    } else if (itemType == 'Reminder') {
      $scope.editorTemplate = $scope.data.template.reminder;
    }
  }
});
