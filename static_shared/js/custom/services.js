app.factory('userProfileService', function(){
  var userProfiles = [];
  if (typeof userProfiles["mySelf"]=="undefined") {
    me = myProfile();
    userProfiles["mySelf"] = me;
    userProfiles[me.url] = me;
  }

  return {
    get : function(userUrl){
      if (typeof userProfiles[userUrl]=="undefined") {
        var user = getUser(userUrl);
        userProfiles[userUrl]= user
      }
      return userProfiles[userUrl];
    },
  }
});

function myProfile(){
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', "/api/HR/users/?mode=mySelf&format=json" , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    var temp = JSON.parse(httpRequest.responseText);
    return temp[0];
  }
}

function getUser(urlGet , mode){
  // console.log(urlGet);
  var httpRequest = new XMLHttpRequest()
  if (urlGet.indexOf('json')==-1) {
    urlGet += '?format=json';
  }
  httpRequest.open('GET', urlGet , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    user = JSON.parse(httpRequest.responseText);
    return user
  }
}
