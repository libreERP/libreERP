var connection = new autobahn.Connection({url: 'ws://'+ wampServer +':8080/ws', realm: 'realm1'});

// "onopen" handler will fire when WAMP session has been established ..
connection.onopen = function (session) {

   console.log("session established!");

   // our event handler we will subscribe on our topic
   //
  function chatResonse (args) {
    var status = args[0];
    var msg = args[1];
    var friend = args[2];
    console.log(args);
    // console.log("event for 'onhello' received: " + msg + " and the status is " + status);
    var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
    if (typeof scope !='undefined' ) {
      scope.$apply(function() {
        if (status =="T" && !scope.$$childHead.isTyping) {
          scope.$$childHead.isTyping = true;
          setTimeout( function(){
            var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
            scope.$apply(function() {
              scope.$$childHead.isTyping = false;
            });
          }, 1500 );
        }else if (status=="M") {
          scope.$$childHead.addMessage(msg , args[3])
          // scope.$$childHead.ims.push({message: msg , originator:scope.$$childHead.friendUrl})
          // scope.$$childHead.senderIsMe.push(false);
        }
      });
    } else {
      if (status == 'T') {
        return;
      }
      var scope = angular.element(document.getElementById('main')).scope();
      scope.$apply(function() {
        scope.fetchAddIMWindow(args[3] , friend);
      });
    }
  }

  processNotification = function(args){

    var scope = angular.element(document.getElementById('main')).scope();
    scope.$apply(function() {
      scope.fetchNotifications(args[0]);
    });
  }

  processUpdates = function(args){
    console.log(args);
    var scope = angular.element(document.getElementById('aside')).scope();
    if (typeof scope != 'undefined') {
      scope.$apply(function() {
        scope.refreshAside(args[0]);
      });
    }
  }

  session.subscribe('service.chat.'+wampBindName, chatResonse).then(
    function (sub) {
      console.log("subscribed to topic 'chatResonse'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.notification.'+wampBindName, processNotification).then(
    function (sub) {
      console.log("subscribed to topic 'notification'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );
  session.subscribe('service.updates.'+wampBindName, processUpdates).then(
    function (sub) {
      console.log("subscribed to topic 'updates'");
    },
    function (err) {
      console.log("failed to subscribed: " + err);
    }
  );

};


  // fired when connection was lost (or could not be established)
  //
connection.onclose = function (reason, details) {
   console.log("Connection lost: " + reason);
}
connection.open();
