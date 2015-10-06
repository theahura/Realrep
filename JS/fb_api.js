/**
	@author: Derek Hong
	@date: 9-5-15
	@version: 0.1

	Description: API to hook into facebook graph api. Used to get various data. 
*/


/**
	Logs a user in and returns the id for that user
*/
function FBlogin(callback) {
	FB.login(function(response) {
   		FB.api("/me", function(response) {
			callback(response.id);
			//console.log(response.id);
		});
   }, {scope: 'public_profile,user_friends'});
};

/**
	Gets a name for a given id and returns the name
*/
function FBgetName(id, callback) {
	var query = "/" + id;
	FB.api(query, function(response) {
		callback(response.name);
	});
};

/**
	Gets a profile picture for a given id and returns the link to that picture
*/
function FBgetProfilePicture(id, callback) {
	var query = "/" + id + "/picture?type=large";
	FB.api(query, function(response) {
		callback(response.data.url);
		//console.log(response.data.url);
	});
};


/**
	Gets a list of friends for a given id and returns the []
*/
function FBgetFriends(id, callback) {
	var query = "/" + id + "/friends";
	FB.api(query, function(response) {
		var friendsList = response.data;
		var idList = [];
		for (i=0; i<friendsList.length; i++) {
			idList[i] = friendsList[i].id;
		}
		callback(idList);
		//console.log(friendsList);
		//console.log(idList);
	});
};


//==================================================================================
//Facebook settings
//==================================================================================

//asynchronously loads the javascript sdk
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));

//on window load, verify the app
window.fbAsyncInit = function() {
	FB.init({
		appId      : '893485884040333',
		xfbml      : true,
		status     : true,
		version    : 'v2.4'
	});
};


