/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Server for handling hashtag data
*/


//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY

var socketTools = require('./socketTools');
var judgrTools = require('./judgrTools');

var global_loggedInRoomName = 'loggedIn';

//Sockets
/**
	Each socket holds the following data:
	friendsList: {}
		key: fbID
		value: {
			data = {} of hashtags and values
			friendsLen = number of FB friends
			assocHashtagList = [] of hashtags
		}
	hashtagList: {}
		key: hashtag
		value: {} of hashtags and values
**/
var io = require('socket.io').listen(6010);

/**
	Generally handles all client requests from a socket. Takes incoming requests, parses by name, and runs necessary checks
	on function inputs before sending data to the requested function. 

	Also responsible for manipulating socket objects

	@param: socket; socket.io connection; the connection to the client sending data
	@param: incomingObj; obj; data sent from client
*/
function serverHandler(socket, incomingObj, callback) {

	if(incomingObj.name === 'getProfile') {
		socketTools.getProfile(socket, incomingObj, callback);
	}
	else if(incomingObj.name === 'getHashtag') {
		socketTools.getHashtag(socket, incomingObj, callback);
	}
	else if(incomingObj.name === 'updateProfileScores') {
		socketTools.updateProfileScores(socket, incomingObj, callback);
	}
	else if(incomingObj.name === 'addUser') {
		socketTools.addUser(socket, incomingObj, callback);
	}
	else if(incomingObj.name === 'updateFriendsLength') {
		socketTools.updateFriendsLength(socket, incomingObj, callback);
	}
	else if(incomingObj.name === 'judgr_getHashtag') {
		judgrTools.getHashtag(socket, incomingObj, callback);
	}
	//Error pipe
	else {
		callback(null, {message: 'Login first/Name not recognized'}, 'appError');
	}
}

//On an io socket connection...
//Main
io.sockets.on('connection', function(socket) {
	console.log("CONNECTED");

	socket.friendsList = {};
	socket.hashtagList = {};
	socket.globalFriendsMod = 5;

	socket.on('disconnect', function() {
     	console.log('Got disconnect!');
   	});

	socket.on('clientToServer', function(data, callback) {
		if(!(data && data.name))
			serverError(socket, 'Data did not have a name');

		serverHandler(socket, data, callback);
	});

});