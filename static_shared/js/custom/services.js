app.factory('userProfileService', function(){
  var userProfiles = [];
  var userSocialPosts = [];
  var userSocialAlbums = [];
  var userSocialPictures = [];

  return {
    get : function(input , refetch){
      if (typeof input == 'number') {
        input = input.toString(); // if the PK is passed then get the string form of it
      } else{
        if (input != 'mySelf') { // url is passed and it will not get converted to int
          input = getPK(input).toString()
        }
      }
      if (typeof userProfiles[input]=="undefined" || refetch) {
        if (input=='mySelf') {
          me = myProfile();
          userProfiles["mySelf"] = me;
          userProfiles[getPK(me.url).toString()] = me;
        } else {
          url = '/api/HR/users/' + input + '/'
          var user = getUser(url);
          userProfiles[input]= user
        }
      }
      return userProfiles[input];
    },
  }
});


function myProfile(){
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', "/api/HR/users/?mode=mySelf&format=json" , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    var temp = JSON.parse(httpRequest.responseText);
    me = temp[0];
    me.url = me.url.split('?')[0]
    return me;
  }
}

function getUser(urlGet , mode){
  // console.log(urlGet);
  if (urlGet.indexOf('api/HR')==-1) {
    urlGet = '/api/HR/users/'+ urlGet + '/'
  }
  if (urlGet.indexOf('json')==-1) {
    urlGet += '?format=json';
  }
  var httpRequest = new XMLHttpRequest()
  httpRequest.open('GET', urlGet , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    user = JSON.parse(httpRequest.responseText);
    user.url = user.url.split('?')[0];
    return user
  }
}
