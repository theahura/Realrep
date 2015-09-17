/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/


var currentLoadedFriend = null;

/**
	Helper method to get the top Six values from a data set
*/
function getTopSix(data) {
	return sortObject(data).splice(-6);
}

/**
	Helper method that takes a list of hashtags and returns an associative list of hashtags
*/
function getAssocHashtagList(hashtagList, callback) {
	deferredArray = [];

	var assocHashtagObj = {};

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

			data = stripDynamoSettings(data);

			jQuery.extend(assocHashtagObj, data);

			for(index in deferredArray) {
				if(deferredArray[index].state() === 'pending') {
					deferredArray[index].resolve();
				}
			}

		});

		deferredArray.push(deferred);
	}

	//store information about file to dynamo through a server
	$.when.apply($, deferredArray).then(function() {

		var assocHashtagList = Object.keys(assocHashtagObj);

		if(callback)
			callback(assocHashtagList);
	});
} 

//==============================================================================================================================

/**
	Defines parameters for a loaded friend
*/
function loadedFriend(data, id) {
	this.topSix = getTopSix(data);
	this.userData = data;
	this.id = id;
	
	this.fullHashtagList = [];
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

		getAssocHashtagList(currentLoadedFriend.topSix, function(assoclist) {
			currentLoadedFriend.fullHashtagList = assoclist;
			console.log(currentLoadedFriend)
			postLoadUser(fbID, assoclist);
		});
	});
}

//========================================================================================================================================

/**
	Checks if there is a breach in top Six
*/
function checkTopSixForUpdates(attribute) {
	//If its already in the top6, check for reshuffles and don't trigger updates
	if(currentLoadedFriend.topSix.indexOf(attribute) !== -1) {
		currentLoadedFriend.topSix = getTopSix(currentLoadedFriend.userData);
		return false;
	}

	//If its not, check if it overrides a zero spot
	if(currentLoadedFriend.userData[attribute] > currentLoadedFriend.userData[currentLoadedFriend.topSix[0]]) {
		return true;
	}

	return false;
}

/**
	Updates a profile with the current score for a user attribute and checks for/calls hashtag updates as needed
*/
function updateUser(attribute, value) {

	//update locally
	if(!currentLoadedFriend.userData[attribute])
		currentLoadedFriend.userData[attribute] = value;
	else
		currentLoadedFriend.userData[attribute] += value;

	//check for hashtag update
	if(checkTopSixForUpdates(attribute)) {
		updateHashtagTopSix(attribute);
	}

	//update profile globally
	socket.emit('clientToServer', {
		name: 'updateProfileScores', 
		hash: currentLoadedFriend.id, 
		attribute: attribute, 
		value: value
	}, function(data, err) {
		
		if(err) {
			alert(err);
			console.log(err);
			return;
		}

	});
}

/**
	Updates hashtag attributes if the topsix is updated
*/
function updateHashtagTopSix(newTopSixHashtag) {

	var kickedHashtag = currentLoadedFriend.topSix[0];

	for(index in currentLoadedFriend.topSix) {

		if(index === '0')
			continue;

		socket.emit('clientToServer', {
			name: 'updateHashtagScores', 
			hash: currentLoadedFriend.topSix[index], 
			attribute: newTopSixHashtag, 
			value: 1
		}, function(data, err) {
			if(err) {
				alert(err);
				console.log(err);
			}
		});

		socket.emit('clientToServer', {
			name: 'updateHashtagScores', 
			hash: currentLoadedFriend.topSix[index], 
			attribute: kickedHashtag, 
			value: -1
		}, function(data, err) {
			if(err) {
				alert(err);
				console.log(err);
			}
		});

		socket.emit('clientToServer', {
			name: 'updateHashtagScores', 
			hash: newTopSixHashtag, 
			attribute: currentLoadedFriend.topSix[index], 
			value: 1
		}, function(data, err) {
			if(err) {
				alert(err);
				console.log(err);
			}
		});

		socket.emit('clientToServer', {
			name: 'updateHashtagScores', 
			hash: kickedHashtag, 
			attribute: currentLoadedFriend.topSix[index], 
			value: -1
		}, function(data, err) {
			if(err) {
				alert(err);
				console.log(err);
			}
		});
	}

	currentLoadedFriend.topSix[0] = newTopSixHashtag;

}