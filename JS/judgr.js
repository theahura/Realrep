/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

var usedTags


function requestUser() {

	usedTags = [];

	//obtain the Facebook ID of a random friend from 
	//the list defined at the start of user login AND REMOVE
	//that friend so that you
	var nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

	//set the profile picture to that user friend
	FBgetProfilePicture(nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	});

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {
		delete data.userId;	//PURGE THE USER ID
		var userTags = Object.keys(data);	//returns an array of the keys (sans userID)
		console.log(userTags);

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

