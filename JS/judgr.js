/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

var usedTags
var userTags
var nextID


function requestUser() {

	usedTags = [];

	//obtain the Facebook ID of a random friend from 
	//the list defined at the start of user login AND REMOVE
	//that friend so that you
	nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

	//set the profile picture to that user friend
	FBgetProfilePicture(nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	});

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {
		var userTags = Object.keys(data);	//returns an array of the keys
		delete userTags.userId;	//PURGE THE USER ID
		console.log(data);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagOne").text(tag[0]);
		usedTags.push(tag[0]);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagTwo").text(tag[0]);
		usedTags.push(tag[0]);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagThree").text(tag[0]);
		usedTags.push(tag[0]);
	});
}

function updateProfile(hashname, value) {
	var updatePackage = {
		hash: userTags.,

	}

	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: userHash
	}), function(data) {
		console.log(data);
	}
}






