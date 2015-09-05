/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/


function requestUser() {

	//obtain the Facebook ID of a random friend from 
	//the list defined at the start of user login
	var nextID = global_friendsList[Math.floor(Math.random()*global_friendsList.length)];

	//set the profile picture to that user friend
	FBgetProfilePicture(nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	})


	//WORK IN PROGRESS===================================================
	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {
		delete data["userId"];	//PURGE THE USER ID
		var userTags = Object.keys(data);	//returns an array of the keys (sans userID)

		//console.log(userTags);
	});
}
