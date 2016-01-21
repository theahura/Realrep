/**
	@author: Derek Hong
	@date: 9-5-15
	@version: 0.1

	Description: API to hook into facebook graph api. Used to get various data. 
*/


/**
	Logs a user in and returns the id for that user, as well as whether or not they allowed friend scopes.
*/
function FBlogin(callback, authType) {

	var loginOpts = {
		scope: 'public_profile,user_friends,user_likes,user_hometown,user_education_history,user_location',
   		return_scopes: true
	}

	if(authType) {
		loginOpts.auth_type = authType;
	}

	FB.login(function(response) {
		if(response.authResponse.grantedScopes) {

			var scopesList = response.authResponse.grantedScopes.split(',');
			var friendScopeGiven = false;

			for(index in scopesList) {
				if(scopesList[index] === 'user_friends') {
					friendScopeGiven = true;
					break;
				}
			}

			FB.api("/me", function(response) {
				callback(response.id, friendScopeGiven);
			});
		}

   }, loginOpts);
};

/**
	Logs a user out
*/
function FBlogout(callback) {
	FB.logout(function(response) {
		if(callback) {
			callback();
		}
	});
}

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
		if(response.error) {
			callback(false);
			return;
		}

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

/**
	Gets a list of pages the user likes
**/
function FBgetLikes(id, callback) {
	var query = "/" + id + "/likes";
	FB.api(query, function(response) {
		if(response && response.data) {
			var likesList = [];
			for(index in response.data) {
				likesList.push(response.data[index].name)
			}
			callback(likesList);
		} else {
			callback(null);
		}
	});
}

/**
	Gets user hometown
**/
function FBgetHomeTown(id, callback) {
	var query = "/" + id + "?fields=hometown";
	FB.api(query, function(response) {
		if(response && response.hometown) {
			var hometown = response.hometown.name;
			callback(hometown);
		} else {
			callback(null);
		}
	});
}

/**
	Gets user location
**/
function FBgetLocation(id, callback) {
	var query = "/" + id + "?fields=location";
	FB.api(query, function(response) {
		if(response && response.location) {
			var location = response.location.name;
			callback(location);
		} else {
			callback(null);
		}
	});
}

/**
	Gets user education
**/
function FBgetEdu(id, callback) {
	var query = "/" + id + "?fields=education";
	FB.api(query, function(response) {
		if(response && response.education) {
			var eduList = [];
			for(index in response.education) {
				eduList.push(response.education[index].school.name);
			}
			callback(eduList);
		} else {
			callback(null);
		}
	});
}

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


