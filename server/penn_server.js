//AWS
//export AWS_ACCESS_KEY_ID
//export AWS_SECRET_ACCESS_KEY

var AWS = require('aws-sdk');
var loginTools = require('./loginTools');
var storageTools = require('./storageTools');


//AWS config
AWS.config.region = 'us-east-1';
var userTable = new AWS.DynamoDB({params: {TableName: 'JAGUsers'}});
var fileTable = new AWS.DynamoDB({params: {TableName: 'JAGClientData'}});
var archiveTable = new AWS.DynamoDB({params: {TableName: 'JAGClientArchiveData'}});

var global_loggedInRoomName = 'loggedIn';

//Sockets
var io = require('socket.io').listen(4000);

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
	//Login pipe
	if(incomingObj.name === 'login') {

		loginTools.loginUser(userTable, fileTable, incomingObj, function(data, err, key) {
			if(data && data.userKey) {
				socket.userKey = data.userKey.S;

				socket.join(global_loggedInRoomName);

				callback(data, err, key);
			} 
			else {
				callback(null, {message: "Username or password incorrect"}, "appError")
			}
		});

	}
	//Post login
	else if(incomingObj.userKey) {

		if(!checkUserKey(socket, incomingObj.userKey)) {
			callback(null, {name: 'loginFailure', message: "Userkey incorrect, command failed"})
		}

		//store data
		if(incomingObj.name === 'store') {
			storageTools.storeData(incomingObj, fileTable, function(data, err, key) {
				if(err) {
					callback(null, err, key);
				}
				else {
					data['name'] = 'updateSearch';
					io.to(global_loggedInRoomName).emit('serverToClient', data);
					callback(data);
				}

			});
		}
		//pull data
		else if(incomingObj.name === 'retrieve') {
			storageTools.retrieveData(incomingObj, fileTable, callback);
		}
		else if(incomingObj.name === 'formDelete') {
			storageTools.deleteData(incomingObj, fileTable, function(data, err, key) {
				if(err) {
					callback(null, err, key);
				}
				else {
					console.log(incomingObj.apptDate)
					io.to(global_loggedInRoomName).emit('serverToClient', {
						name: 'removeFromSearch', 
						patient: incomingObj.patient,
						apptDate: incomingObj.apptDate
					});

					callback();
				}
			});
		}
		else if (incomingObj.name === 'closeInjury') {
			storageTools.closePatientInjury(incomingObj, fileTable, archiveTable, function(data, err, key) {
				if(err) {
					callback(null, err, key);
				}
				else {
					io.to(global_loggedInRoomName).emit('serverToClient', {
						name: 'removeFromSearch', 
						patient: incomingObj.patient
					});

					callback();
				}
			});
		}
		//logout
		else if(incomingObj.name === 'logout') {
			socket.userKey = null; 

			callback();
		}
		else {
			callback(null, {message: 'Login first/Name not recognized'}, 'appError');
		}
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