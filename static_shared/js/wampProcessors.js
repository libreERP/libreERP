var connection = new autobahn.Connection({url: 'ws://10.140.1.232:8080/ws', realm: 'realm1'});

// "onopen" handler will fire when WAMP session has been established ..
connection.onopen = function (session) {

   console.log("session established!");

   // our event handler we will subscribe on our topic
   //
  function chatResonse (args) {
    var msg = args[1];
    var status = args[0];
    var friend = args[2];
    // console.log(args);
    // console.log("event for 'onhello' received: " + msg + " and the status is " + status);
    var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
    // console.log(scope);
    // console.log();
    scope.$apply(function() {
      // console.log(scope);
      if (status =="T" && !scope.$$childHead.isTyping) {
        scope.$$childHead.isTyping = true;
        // console.log("yes its inside the T");
        // console.log(scope);
        setTimeout( function(){
          var scope = angular.element(document.getElementById('chatWindow'+friend)).scope();
          // console.log(scope);
          scope.$apply(function() {
            scope.$$childHead.isTyping = false;

          });
        }, 1500 );
      }else if (status=="M") {
        // console.log(msg);
        scope.$$childHead.ims.push({message: msg , originator:scope.$$childHead.friendUrl})
        scope.$$childHead.senderIsMe.push(false);
      }

    });

  }

  processNotification = function(args){
    // console.log(args);
    var scope = angular.element(document.getElementById('headerNotificationCtrl')).scope();
    scope.$apply(function() {
      // console.log(notificationCtrlScope);
      scope.fetchNotifications();
    });
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

};


  // fired when connection was lost (or could not be established)
  //
connection.onclose = function (reason, details) {
   console.log("Connection lost: " + reason);
}
connection.open();
