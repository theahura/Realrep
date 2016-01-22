/**
	@author: Amol Kapoor
	@date: 1-17-16
	@version: 0.1

	Description: Internal tool to make sure user table matches hashtag table in terms of data values
*/

//Initial set up
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

var hashtagTable = new AWS.DynamoDB({params: {TableName: 'rerep_hashtags'}});
var userTable = new AWS.DynamoDB({params: {TableName: 'rerep_users'}});

userTable.hashVal = "userId";
hashtagTable.hashVal = "hashtag";


var usersWithMultipleFriends = {
	'10208734533066461': 2,
	'1000316276657653': 2,
	'951921014854065': 2,
	'1011479035577498': 3
}	

/**
	Retrieves data of a table

	@param: incomingObj; {}
	@param: table; dynamo db table; where to get data
	@param: callback; function(data, err)
*/
function retrieveData(table, callback) {

	table.scan({}, function(err, data)  {

		if(err) {
			console.log('got error')
			callback(null, err);
		}
		else if(data) {
			callback(data);
		}
		else {
			console.log('coundnt find anything')
			callback(null);
		}
	});
}


//Get entire user table
retrieveData(userTable, function(data, err) {

	if(err) {
		console.log(err);
		return;
	}

	if(!data) {
		console.log('no data');
		return;
	} 

	var hashtagObjList = {};

	//console.log(data);
	for(index in data.Items) {

		var userObj = data.Items[index];

		var uID = userObj[userTable.hashVal].S;

		var limitNum = 1;

		//Get number of friends using the app per user, hardcoded right now but will
		//eventually pull user friends list count from db
		if(usersWithMultipleFriends[uID])
			limitNum = usersWithMultipleFriends[uID];

		delete userObj[userTable.hashVal];

		for(key1 in userObj) {

			if(!hashtagObjList[key1]) {
				hashtagObjList[key1] = {};
			}

			if(parseInt(userObj[key1].N) < limitNum) 
				continue;

			for(key2 in userObj) {

				if(parseInt(userObj[key2].N) < limitNum) 
					continue; 

				if(key1 === key2) 
					continue;

				if(!hashtagObjList[key1][key2])
					hashtagObjList[key1][key2] = 1;
				else 
					hashtagObjList[key1][key2]++;
			}
		}
	}

	var newHashtagObjList = {};

	for(key1 in hashtagObjList) {

		if(!newHashtagObjList[key1]) {
			newHashtagObjList[key1] = {};
			newHashtagObjList[key1][hashtagTable.hashVal] = {'S':key1};
		}

		for(key2 in hashtagObjList) {

			if(key1 === key2 || !hashtagObjList[key1][key2]) 
				continue;

			newHashtagObjList[key1][key2] = {'N': hashtagObjList[key1][key2].toString()};
		}

		hashtagTable.putItem({Item: newHashtagObjList[key1]}, function(data, err) {
			console.log(data);
			console.log(err);
		});
	}
});

//Map relations for each hashtag and load
