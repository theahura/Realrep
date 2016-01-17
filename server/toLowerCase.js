/**
	@author: Amol Kapoor
	@date: 1-17-16
	@version: 0.1

	Description: Internal tool to set all values in database to lower case
*/


//Initial set up
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

var hashtagTable = new AWS.DynamoDB({params: {TableName: 'rerep_hashtags'}});
var userTable = new AWS.DynamoDB({params: {TableName: 'rerep_users'}});

userTable.hashVal = "userId";
hashtagTable.hashVal = "hashtag";


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

/**
//User table first
retrieveData(userTable, function(data, err) {

	if(err) {
		console.log(err);
		return;
	}

	if(!data) {
		console.log('no data');
		return;
	} 

	//console.log(data);
	for(index in data.Items) {
		var userObj = data.Items[index];

		var key, keys = Object.keys(userObj);
		var n = keys.length;
		var newobj={}
		while (n--) {
			key = keys[n];

			if(key === userTable.hashVal)
				newobj[key] = userObj[key];
			else if (key === 'friendsListCount_079209086357678') {
				newobj[key] = hashObj[key];			
			}
			else	
				newobj[key.toLowerCase()] = userObj[key];
		}

		console.log('------------------------------------------------')
		console.log(newobj);
		userTable.putItem({Item: newobj}, function(data, err) {
			console.log(err)
		});
	}

});*/


//then hashtag table
retrieveData(hashtagTable, function(data, err) {

	if(err) {
		console.log(err);
		return;
	}

	if(!data) {
		console.log('no data');
		return;
	} 

	//console.log(data);
	for(index in data.Items) {
		var hashObj = data.Items[index];

		var key, keys = Object.keys(hashObj);
		var n = keys.length;
		var newobj={}
		while (n--) {
			key = keys[n];

			if(key === hashtagTable.hashVal)
				newobj[key] = {'S': hashObj[key].S.toLowerCase()};
			else if (key === 'friendsListCount_079209086357678') {
				newobj[key] = hashObj[key];			
			}
			else	
				newobj[key.toLowerCase()] = hashObj[key];
		}

		console.log('------------------------------------------------')
		console.log(newobj);
		hashtagTable.putItem({Item: newobj}, function(data, err) {
			console.log(err)
		});
	}
});