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

var global_loggedInRoomName = 'loggedIn';

//Sockets
var io = require('socket.io').listen(6010);

/**
	Checks an input string to make sure it is sanitized for database input

	@param: inputString; string; the string to be checked

	@return: true if alphanumeric string of some length, false otherwise
*/
function isSanitized(inputString) {
	if(!inputString || typeof inputString !== 'string' || inputString.length === 0 || !/^[a-z0-9]+$/i.test(inputString))
		return false;
	return true;
}

/**
	Checks if the userkey equals the login key stored on the server

	@param: socket; socket.io connection; should have socket.userkey has sub param
	@param: userKey; string; 
*/
function checkUserKey(socket, userKey) { 
	if(userKey === socket.userKey)
		return true;
	else
		return false;
}


/**
	Generic error reply function. Sends a message to a socket with error as message header

	@param: socket; socket.io connection; connection to user who needs to see error
	@param: message; string; the message to send to the user
*/
function serverError(socket, message) {
	socket.emit('serverToClient',{
		name: 'Error',
		message: message
	});
}

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

	socket.on('disconnect', function() {
     	console.log('Got disconnect!');
   	});

	socket.on('clientToServer', function(data, callback) {
		if(!(data && data.name))
			serverError(socket, 'Data did not have a name');

		serverHandler(socket, data, callback);
	});

});