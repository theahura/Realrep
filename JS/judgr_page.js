/**
/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/


var currentLoadedFriend = null;

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

		if(err) {
			alert(err);
			console.log(err);
			return;
		}

		if(!data) {

			judgr_loadUser(null, callback);

			return;
		}

		currentLoadedFriend = new judgr_loadedFriend(data, fbID);

		var deferredFriendLen = new $.Deferred();

		if(friendLength) {
			currentLoadedFriend.friendLength = friendLength;
			deferredFriendLen.resolve();
		} else {
			FBgetFriends(fbID, function(friends) {
				currentLoadedFriend.friendLength = friends.length;
				deferredFriendLen.resolve();
			});
		}

		$.when.apply($, [deferredFriendLen]).then(function() {
			postLoadUser(fbID);
		    
		    if(callback)
		    	callback();
		});
	});
}

/**
	Load tags to HTML elements
**/
function judgr_loadTag(callback) {
	socket.emit('clientToServer', {
		name: 'judgr_getHashtag',
		hash: currentLoadedFriend.id
	}, function(tag) {
		if(callback)
			callback(tag);
	});
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
$('.passbutton').on('click', endorsebuttonHelper);

function endorsebuttonHelper(e) {
//Check if judge count is high enough
	global_judgesOnUser++;

	var tag = $('.hashtag').html();
	
	if(tag) {
		judgr_updateUser(tag, 1);
	}

	$('.endorsebutton').off('click')


	$('.hashtag').slideToggle('fast', function() {
		$(this).html("");
		if(global_judgesOnUser%global_judgesTillUserSwitch === 0) {
			judgr_loadUser(null, function() {
	    		$('.endorsebutton').on('click',endorsebuttonHelper);				
			});
		} else {
			judgr_loadTag(function(newTag) {
	    		$('.hashtag').html(newTag).slideToggle('fast', function() {
	    		 	$('.endorsebutton').on('click',endorsebuttonHelper);
	    		});
			});
		}
	});
}

/**
	Swipe against a hashtag that should not be associated with the profile that is currnetly loaded
*/
$('.passbutton').on('click', passbuttonHelper);

function passbuttonHelper(e) {
	global_judgesOnUser++;

	$('.passbutton').off('click')

	$('.hashtag').slideToggle('fast', function() {
		$(this).html("");
		if(global_judgesOnUser%global_judgesTillUserSwitch === 0) {
			judgr_loadUser(null, function() {
				$('.passbutton').on('click',passbuttonHelper);
			});
		} else {
			judgr_loadTag(function(newTag) {
	    		$('.hashtag').html(newTag).slideToggle('fast', function() {
	    		 	$('.passbutton').on('click',passbuttonHelper);
	    		});
			});
		}
	});
}


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
function postLoadUser(fbID) {
    FBgetProfilePicture(fbID, function(url) {
        $(".profile-picture").attr("src", url);
    });

    FBgetName(fbID, function(name) {
    	$(".friend-name").html(name);
    });

    $('.' + mapReference['other-profile-page']).empty();

    judgr_loadTag(function(tag) {
    	$('.hashtag').html(tag).slideToggle('fast');
    });

    global_state.pageState = {
    	loadedFriend: currentLoadedFriend
    };
}
