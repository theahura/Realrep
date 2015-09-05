/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

function requestUser() {

	var nextID = global_friendsList[Math.floor(Math.random()*global_friendsList.length)];

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {
		console.log(data);
	});
}
