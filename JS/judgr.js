/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

$("#NewUserSelect").click(function() {
	requestUser();
});

function requestUser() {

	var nextID = global_friendsList[Math.floor(Math.random()*global_friendsList.length)];

	FBgetProfilePicture(nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	})

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {
		delete data["userId"];	//PURGE THE USER ID
		var userTags = Object.keys(data);	//returns an array of the keys (sans userID)

		console.log(userTags);
	});
}
