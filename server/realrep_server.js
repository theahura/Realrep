/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Server for handling hashtag data
*/


//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY

var AWS = require('aws-sdk');
var loginTools = require('./loginTools');
var storageTools = require('./storageTools');

//AWS config
AWS.config.region = 'us-east-1';

var global_loggedInRoomName = 'loggedIn';

//Sockets
var io = require('socket.io').listen(6010);

var hashtagTable = new AWS.DynamoDB({params: {TableName: 'pennapps2015hashtags'}});
var userTable = new AWS.DynamoDB({params: {TableName: 'pennapps2015users'}});

userTable.hashVal = "userId";
hashtagTable.hashVal = "hashtag";


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

	@param: socket; socket.io connection; the connection to the client sending data
	@param: incomingObj; obj; data sent from client
*/
function serverHandler(socket, incomingObj, callback) {

	if(incomingObj.name === 'getProfile') {
		//load all of the hashtag data for a given user and send it back in callback
		//incomingObj must contain: userId
		storageTools.retrieveData(incomingObj, userTable, callback);
	}
	else if(incomingObj.name === 'checkUser') {
		//Check if a user already exists
		loginTools.checkUser(incomingObj, userTable, callback);
	}
	else if(incomingObj.name === 'getHashtag') {
		//load all of the related hashtag data 
		//incomingObj must contain: hashtag
		storageTools.retrieveData(incomingObj, hashtagTable, callback);
	}
	else if(incomingObj.name === 'updateProfileScores') {
		//update the hashtag data in a profile
		//incomingObj must contain userId
		storageTools.updateScores(incomingObj, userTable, callback);
	}
	else if(incomingObj.name === 'updateHashtagScores') {
		//update the hashtag data in a hashtag
		//incomingObj must contain hashtag
		storageTools.updateScores(incomingObj, hashtagTable, callback);
	}
	else if(incomingObj.name === 'addUser') {
		storageTools.addUser(incomingObj, userTable, hashtagTable, callback);
	}
	//Error pipe
	else {
		console.log(incomingObj)
		callback(null, {message: 'Login first/Name not recognized'}, 'appError');
	}

}

//On an io socket connection...
//Main
io.sockets.on('connection', function(socket) {
	console.log("CONNECTED")

	socket.on('disconnect', function() {
     	console.log('Got disconnect!');
   	});

	socket.on('clientToServer', function(data, callback) {
		if(!(data && data.name))
			serverError(socket, 'Data did not have a name');

		serverHandler(socket, data, callback);
	});

});