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

			var baseHashtag = hashtagList[index];

			data = stripDynamoSettings(data);

			flippedHashtagObj[baseHashtag] = baseHashtag;

			for(key in data) {
				flippedHashtagObj[key] = baseHashtag;
			}

			jQuery.extend(assocHashtagObj, data);

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
function judgr_loadedFriend(data, id) {
	this.id = id;
	this.fullHashtagList = Object.keys(data);
	this.hashtagRootObj = {};
}


/**
	Pulls up a users profile info and sets up the hashtag list
*/
function judgr_loadUser() {

	if(global_friendsList.length === 0)
		global_friendsList = global_friendsListUnmodified.slice(0);

	var fbID = global_friendsList.pop();

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: fbID
	}, function(data, err) {

		if(!data) {
			judgr_loadUser();
			return;
		}

		if(err) {
			alert(err);
			console.log(err);
			return;
		}

		data = stripDynamoSettings(data);

		console.log(data);

		currentLoadedFriend = new judgr_loadedFriend(data, fbID);

		judgr_getAssocHashtagList(currentLoadedFriend.fullHashtagList, function(assoclist, flippedHashtagObj) {
			currentLoadedFriend.fullHashtagList = assoclist;
			currentLoadedFriend.hashtagRootObj = flippedHashtagObj;
			postLoadUser(fbID, assoclist);
		});
	});
}

//========================================================================================================================================


/**
	Updates a profile with the current score for a user attribute and checks for/calls hashtag updates as needed
*/
function judgr_updateUser(attribute, value) {

	//update profile globally
	socket.emit('clientToServer', {
		name: 'updateProfileScores', 
		hash: currentLoadedFriend.id, 
		attribute: attribute, 
		value: value,
		checkRoot: currentLoadedFriend['hashtagRootObj'][attribute], 
		friendLength: global_friendsListUnmodified.length
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
	if (global_friendsList.length == 0) {
		$(".profile-picture").attr("src", "../img/web1.png");
		$(".hashtag").html("");
	}
	else {
		judgr_loadUser();
	}
});


/**
	Select a hashtag to be associated with the profile that is currently loaded
*/
$('.endorsebutton').click(function() {
	var button = $('.hashtag'); 

	if(!$('.hashtag').html()) {
		return;
	}

	judgr_updateUser($('.hashtag').html(), 1);

	var global_userTags = currentLoadedFriend.fullHashtagList;

	if(global_userTags.length > 0) { 
		var tag = global_userTags[Math.floor(Math.random()*global_userTags.length)];
		$(button).html(tag);
	}
	else {
		$(button).html("");
	}
});

/**
	Swipe against a hashtag that should not be associated with the profile that is currnetly loaded
*/
$('.passbutton').click(function() {
	var button = $('.hashtag'); 

	if(!$('.hashtag').html()) {
		return;
	}

	var global_userTags = currentLoadedFriend.fullHashtagList;

	if(global_userTags.length > 0) { 
		var tag = global_userTags[Math.floor(Math.random()*global_userTags.length)];
		$('.hashtag').html(tag);
	}
	else {
		$(button).html("");
	}
});


/**
	Loads the map for a friends profile on click from the profile picture
*/
$('.profile-picture').click(function() { 
    $('.judgrpage').slideToggle();
    $('.other-profile-page').slideToggle(function() {
        otherprofile_loadOtherProfileMap();
    });
});


/**
	Moves from the judgr page to the self profile page
*/
$('.judgr-to-profile').click(function() {
    $('.judgrpage').slideToggle();
    $('.self-profile-page').slideToggle();
    selfprofile_loadProfileMap();               
})



function postLoadUser(fbID, hashtagList) {
    FBgetProfilePicture(fbID, function(url) {
        $(".profile-picture").attr("src", url);
    });

    FBgetName(fbID, function(name) {
    	$(".friend-name").html(name);
    });

    var tag = hashtagList[Math.floor(Math.random()*hashtagList.length)];
    $(".hashtag").html(tag);
}
