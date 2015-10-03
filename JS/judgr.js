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
function getAssocHashtagList(hashtagList, callback) {
	deferredArray = [];

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
function loadedFriend(data, id) {
	this.id = id;
	this.fullHashtagList = Object.keys(data);
	this.hashtagRootObj = {};
}


/**
	Pulls up a users profile info and sets up the hashtag list
*/
function loadUser() {
	var fbID = global_friendsList.pop();

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: fbID
	}, function(data, err) {

		if(!data) {
			loadUser();
			return;
		}

		if(err) {
			alert(err);
			console.log(err);
			return;
		}

		data = stripDynamoSettings(data);

		console.log(data);

		currentLoadedFriend = new loadedFriend(data, fbID);

		getAssocHashtagList(currentLoadedFriend.fullHashtagList, function(assoclist, flippedHashtagObj) {
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
function updateUser(attribute, value) {

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