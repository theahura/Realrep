/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for viewing correlations
*/


var global_usedTags;
var global_userTags;
var global_userData;
var global_nextID;
var global_topFive;


function loadMap() {
	socket.emit('clientToServer', {
		name: 'getHashtag',
		hash: $('#SearchForCorrelation').val()
	}, function(data, err) {
		console.log(data);
	});
}