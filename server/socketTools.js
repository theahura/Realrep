/**
@author: Amol Kapoor
@date: 1-21-16
@version: 0.1

Socket manipulation module. Link from server to storage. Saves data in socket caches. 
*/

//AWS config and environment
var AWS = require('aws-sdk');
var async = require('async');

AWS.config.region = 'us-east-1';

var storageTools = require('./storageTools');
var judgrTools = require('./judgrTools');

var hashtagTable = new AWS.DynamoDB({params: {TableName: 'rerep_hashtags'}});
var userTable = new AWS.DynamoDB({params: {TableName: 'rerep_users'}});

userTable.hashVal = "userId";
hashtagTable.hashVal = "hashtag";


/**
	Returns a dynamo object as key value pairs, deleting hash key data that shouldn't be pulled otherwise
*/
function stripDynamoSettings(data) {
	delete data[userTable.hashVal];
	delete data[hashtagTable.hashVal];

	var dataObj = {};

	for(key in data) {
		if('S' in data[key]) {
			dataObj[key] = data[key].S
		}
		else if('N' in data[key])
			dataObj[key] = parseInt(data[key].N)
	}

	return dataObj;
}

/**
	Actually generates the relevant hashtag list and returns the list in callback
**/
function createAssocHashtagListHelper(socket, hashtagList, callback) {

	var deferredArray = [];

	var assocHashtagObj = {};

	var flippedHashtagObj = {};

	async.forEachOf(hashtagList, getHashtagWrapper, function(err) {

		if(err) {
			console.log(err);
			if(callback) 
				callback(err);
			return;
		}

		var assocHashtagList = Object.keys(assocHashtagObj);

		if(callback)
			callback(assocHashtagList, flippedHashtagObj);
	});

	/**
		Used by the Async module, takes in an item and if there is an error, pass callback with err message
	**/
	function getHashtagWrapper(hashtagVal, hashtag, callback) {

		module.exports.getHashtag(socket, {hash: hashtag}, function(data, err) {

			if(err) {
				callback(err);
				return;
			}

			if(data) {
				for (var attrname in data) { assocHashtagObj[attrname] = data[attrname]; }
			}

			callback();
		});
	}
}

//Exposed functions
module.exports = {

	/**
		Handles getting individual profiles. Will attempt to store that profile to the user socket
		for caching. 

		callback(data, error, requested hash, friendLength)
	**/
	getProfile: function(socket, incomingObj, callback) {
		if(socket.friendsList[incomingObj.hash]) {
			callback(socket.friendsList[incomingObj.hash].data, null, incomingObj.hash, socket.friendsList[incomingObj.hash].friendLen);
			return;
		}

		//load all of the hashtag data for a given user and send it back in callback
		//incomingObj must contain: userId
		storageTools.retrieveData(incomingObj, userTable, function(data, err) {

			if(err || !data) {
				callback(null, err);
				return;			
			}

			data = stripDynamoSettings(data);

			var friendLength;

			if(data['friendsListCount_079209086357678']) {
				friendLength = data['friendsListCount_079209086357678'];
				delete data['friendsListCount_079209086357678'];
			}

			callback(data, null, incomingObj.hash, friendLength);

			//store data and friendlength
			socket.friendsList[incomingObj.hash] = {
				data: data, 
				friendLen: friendLength
			};

			createAssocHashtagListHelper(socket, data, function(assocHashtagList, flippedHashtagObj) {
				socket.friendsList[incomingObj.hash].assocHashtagList = assocHashtagList;
			});
		});
	},

	/**
		Handles getting individual hashtag. Attempts to store that data in the socket for caching.
		
		callback(data, error, requested hash)
	**/
	getHashtag: function(socket, incomingObj, callback) {

		if(socket.hashtagList[incomingObj.hash]) {
			callback(socket.hashtagList[incomingObj.hash], null, incomingObj.hash);
			return;
		}

		//load all of the related hashtag data 
		//incomingObj must contain: hashtag
		storageTools.retrieveData(incomingObj, hashtagTable, function(data, err) {
			
			if(err || !data) {
				callback(null, err);
				return;
			}

			data = stripDynamoSettings(data);

			callback(data, null, incomingObj.hash);

			socket.hashtagList[incomingObj.hash] = data;
		});
	},

	/**
		Updates scores in a profile. Starts by updating the user scores, then checks if 
		hashtags need updates as well.
	**/
	updateProfileScores: function(socket, incomingObj, callback) {
		//update the hashtag data in a profile
		//incomingObj must contain userId and a root

		if(incomingObj.attribute === hashtagTable.hashVal || incomingObj.attribute === userTable.hashVal) {
			callback(null, {message: 'Error: invalid hash name or attribute name'});
			return;
		}

		if(!incomingObj['value'] || incomingObj['value'] > 1 || incomingObj['value'] < -1) {
			callback(null, {message:"Value too high or too low or null"});
			return;			
		}

		storageTools.updateScores(incomingObj, userTable, 'ADD', function(data, err) {
			storageTools.updateHashtags(incomingObj, hashtagTable, userTable, data);
			callback(data, err);
		});		
	},

	/**
		Adds new user to the system. Stores the login profile.
	**/
	addUser: function(socket, incomingObj, callback) {
		storageTools.addUser(incomingObj, userTable, hashtagTable, function(data, err) {

			if(err || !data) {
				callback(null, err);
				return;
			}

			data = stripDynamoSettings(data);

			callback(data);

			if(incomingObj.dataID === 'selfProfile') {
				socket.selfProfile = incomingObj.hash;
			}

			socket.friendsList[incomingObj.hash] = data;
		});
	},

	/**
		Updates the length of friends stored for a user.
	**/
	updateFriendsLength: function(socket, incomingObj, callback) {

		if(incomingObj.value === socket.friendsList[socket.selfProfile]) {
			callback();
			return;
		}

		//pull friends length data
		//if friends length update is greater, 1) pull profile and manipulate hashtag values; 2) update friends length
		storageTools.updateScores(incomingObj, userTable, 'SET', callback);
	}
}
