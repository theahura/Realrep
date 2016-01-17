/**
	@author: Amol Kapoor
	@date: 1-17-16
	@version: 0.1

	Description: Internal tool to delete all hashtag values with uppercased hashvals
*/


//Initial set up
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

var hashtagTable = new AWS.DynamoDB({params: {TableName: 'rerep_hashtags'}});

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

		var hashtag = hashObj[hashtagTable.hashVal].S;

		if(hashtag.toLowerCase() !== hashtag) {
			hashtagTable.deleteItem({
				Key: {
					'hashtag': {
						'S':hashtag
					}
				}
			}, function(data, err) {
				console.log(err);
				console.log(data);
			});
		}
	}
});