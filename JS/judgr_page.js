/**
/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/


var currentLoadedFriend = null;

/**
	Helper method that takes a list of hashtags and returns an associative list of hashtags

	@param: hashtagList; the list of hashtags to search over
	@param: callback; function(assocHashtagList, flippedHashtagObj)
		list of the associated hashtags
		obj tying an assoc hashtag to the original one
*/
function judgr_getAssocHashtagList(hashtagList, callback) {

	var deferredArray = [];

	var assocHashtagObj = {};

	var flippedHashtagObj = {};

	for(index in hashtagList) {	

		deferred = new $.Deferred();

		socket.emit('clientToServer', {
			name: 'getHashtag', 
			hash: hashtagList[index]
		}, function(data, err) {

			if(err) {
				alert(err);
				console.log(err);
				return;
			}

			if(data) {
				var baseHashtag = hashtagList[index];

				flippedHashtagObj[baseHashtag] = baseHashtag;

				for(key in data) {
					flippedHashtagObj[key] = baseHashtag;
				}

				jQuery.extend(assocHashtagObj, data);
			}

			for(index in deferredArray) {
				if(deferredArray[index].state() === 'pending') {
					deferredArray[index].resolve();
					break;
				}
			}
		});

		deferredArray.push(deferred);
	}

	//store information about file to dynamo through a server
	$.when.apply($, deferredArray).then(function() {
		var assocHashtagList = Object.keys(assocHashtagObj);

		if(callback)
			callback(assocHashtagList, flippedHashtagObj);
	});
} 

//==============================================================================================================================

/**
	Defines parameters for a loaded friend
*/
function judgr_loadedFriend(data, id, friendLength) {
	this.id = id;
	this.fullHashtagList = Object.keys(data);
	this.hashtagRootObj = {};
	this.friendLength = friendLength;
}


/**
	Pulls up a users profile info and sets up the hashtag list

	@param: fbID; string; a facebook id
*/
function judgr_loadUser(fbID, callback) {

	if(!fbID) {
		if(global_friendsListUnmodified.length === 0) {
			return;
		}

		if(global_friendsList.length === 0)
			global_friendsList = global_friendsListUnmodified.slice(0);

		var popIndex = Math.floor(Math.random() * global_friendsList.length);
		fbID = global_friendsList.splice(popIndex, 1)[0];
	}
	

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: fbID
	}, function(data, err, requestedID, friendLength) {

		alert(requestedID);
		alert(friendLength);

		if(err) {
			alert(err);
			console.log(err);
			return;
		}

		if(!data) {
			judgr_loadUser();
			return;
		}

		currentLoadedFriend = new judgr_loadedFriend(data, fbID);

		var deferredFriendLen = new $.Deferred();
    	var deferredAssocHash = new $.Deferred();

		if(friendLength) {
			currentLoadedFriend.friendLength = friendLength;
			deferredFriendLen.resolve();
		} else {
			FBgetFriends(fbID, function(friends) {

				if(!friends) {
					alert('Friend has disabled viewing their account');
					return;
				}
				
				currentLoadedFriend.friendLength = friends.length;
				deferredFriendLen.resolve();
			});
		}

		judgr_getAssocHashtagList(currentLoadedFriend.fullHashtagList, function(assoclist, flippedHashtagObj) {
			currentLoadedFriend.fullHashtagList = assoclist;
			currentLoadedFriend.hashtagRootObj = flippedHashtagObj;

			postLoadUser(fbID, assoclist);
			deferredAssocHash.resolve();
		});

		$.when.apply($, [deferredFriendLen, deferredAssocHash]).then(function() {
		    callback();
		});
	});
}

/**
	Load tags to HTML elements
**/
function judgr_loadTag() {
	var userTags = currentLoadedFriend.fullHashtagList;

	//Check if judge count is high enough
	global_judgesOnUser++;

	if(global_judgesOnUser%global_judgesTillUserSwitch === 0) {
		judgr_loadUser();
		return;
	}

	if(userTags.length > 0) { 

		var tag = "";

		if(userTags.length < 50 && Math.random() <= global_randomAssociationNum) {

			var index = Math.floor(Math.random()*global_adj_associations.length);

			tag = global_adj_associations[index];

		} else {

			var index = Math.floor(Math.random()*userTags.length);

			tag = userTags.splice(index, 1);

		}

		$('.hashtag').html(tag);
	}
	else {
		var tag = global_adj_associations[Math.floor(Math.random()*global_adj_associations.length)];
		$('.hashtag').html(tag);
	}
}


//========================================================================================================================================


/**
	Updates a profile with the current score for a user attribute and checks for/calls hashtag updates as needed

	@param: attribute; string; the user id
	@param: value; string; the value of the score being updated
*/
function judgr_updateUser(attribute, value) {

	//update profile globally
	socket.emit('clientToServer', {
		name: 'updateProfileScores', 
		hash: currentLoadedFriend.id, 
		attribute: attribute, 
		value: value,
		checkRoot: currentLoadedFriend['hashtagRootObj'][attribute], 
		friendLength: currentLoadedFriend.friendLength
	}, function(data, err) {
		
		if(err) {
			alert(err);
			console.log(err);
			return;
		}

	});
}
 

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


/**
	Load a new user in the judgr profile slot
*/
$("#NewUserSelect").click(function() {
	judgr_loadUser();
});

/**
	Select a hashtag to be associated with the profile that is currently loaded
*/
$('.endorsebutton').click(function() {

	var tag = $('.hashtag').html();
	$('.hashtag').html("");

	if(!tag) {
		return;
	}

	judgr_updateUser(tag, 1);

	judgr_loadTag();
});

/**
	Swipe against a hashtag that should not be associated with the profile that is currnetly loaded
*/
$('.passbutton').click(function() {
	var tag = $('.hashtag').html();
	$('.hashtag').html("");

	if(!tag) {
		return;
	}

	judgr_loadTag();
});


/**
	Loads the map for a friends profile on click from the profile picture
*/
$('.judgrpage .profile-picture').click(function() { 
    changePage('other-profile-page', currentLoadedFriend.id);
});


/**
	Moves from the judgr page to the self profile page
*/
$('.judgr-to-profile').click(function() {
	changePage('self-profile-page');
});


/**
	After a user has been loaded to the judgr frontend, load all of the UI elements

	@param: fbID; the id of the loaded friend
	@param: hashtagList; the list to pop from
**/
function postLoadUser(fbID, hashtagList) {
    FBgetProfilePicture(fbID, function(url) {
        $(".profile-picture").attr("src", url);
    });

    FBgetName(fbID, function(name) {
    	$(".friend-name").html(name);
    });

    $('.' + mapReference['other-profile-page']).empty();

    var tag = hashtagList[Math.floor(Math.random()*hashtagList.length)];
    $(".hashtag").html(tag);

    global_state.pageState = {
    	loadedFriend: currentLoadedFriend
    };
}
