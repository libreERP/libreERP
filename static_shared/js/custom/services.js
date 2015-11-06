app.factory('userProfileService', function(){
  var userProfiles = [];
  var userSocialPosts = [];
  var userSocialAlbums = [];
  var userSocialPictures = [];

  return {
    get : function(userUrl , refetch){
      if (typeof userProfiles[userUrl]=="undefined" || refetch) {
        if (userUrl=='mySelf') {
          me = myProfile();
          userProfiles["mySelf"] = me;
          userProfiles[me.url] = me;
        } else {
          var user = getUser(userUrl);
          userProfiles[userUrl]= user
        }
      }
      return userProfiles[userUrl];
    },
    social: function(username , item){
      if (item == "post") {
        if (typeof userSocialPosts[username]=="undefined") {
          var posts =  getSocialContent(username , 'post');
          userSocialPosts[username]=posts;
        }
        return userSocialPosts[username];

      }else if (item == "pictures") {

        if (typeof userSocialPictures[username]=="undefined") {
          var pictures = getSocialContent(username , 'picture');
          userSocialPictures[username]=pictures;
        }
        return userSocialPictures[username];
      }else if (item == "albums") {
        if (typeof userSocialAlbums[username]=="undefined") {
          var albums =  getSocialContent(username , 'album');
          userSocialAlbums[username]=albums;
        }
        return userSocialAlbums[username];
      }
    },
  }
});
function getSocialContent(username, mode){
  var httpRequest = new XMLHttpRequest();
  // console.log(mode);
  var urlStr = '/api/social/'+mode+'/?format=json&user='+ username;
  httpRequest.open('GET', urlStr , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    // console.log("returning from the getSocialContent");
    return JSON.parse(httpRequest.responseText);
  }
}
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
  var httpRequest = new XMLHttpRequest()
  if (urlGet.indexOf('json')==-1) {
    urlGet += '?format=json';
  }
  httpRequest.open('GET', urlGet , false);
  httpRequest.send(null);
  if (httpRequest.status === 200) { // successfully
    user = JSON.parse(httpRequest.responseText);
    user.url = user.url.split('?')[0];
    return user
  }
}
