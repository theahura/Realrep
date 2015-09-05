/**
@author: Amol Kapoor
@date: 7-20-15
@version: 0.1

File storage module
*/

//Exposed functions
module.exports = {

	/**
		Retrieves data of a specific user using table.query
		Pulls down last 5 days in order of most recent

		@param: incomingObj; {}
			@param: patient; string; the patient name (hash)
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	retrieveData: function(incomingObj, table, callback) {
		var requestObj = {Key: {}};

		requestObj['Key'][table.hashVal] = {'S':incomingObj['hash']};


		table.getItem(requestObj, function(err, data)  {
			if(err) {
				callback(null, err);
			}
			else if(data.Item) {
				callback(data.Item);
			}
			else {
				callback(null);
			}
		});
	},

	/**
		Updates the scores of a specific data attribute with numeric values

		incomingObj must contain: 
			'hash': string
			'value': number
	*/
	updateScores: function(incomingObj, table, callback) {

		if(!incomingObj['value'])
			incomingObj['value'] = 0;

		var requestObj = {
							Key: {}, 
					 	    "UpdateExpression" : "ADD #attrName :attrValue",
						    "ExpressionAttributeNames" : {
						        "#attrName" : incomingObj['attribute']
						    },
						    "ExpressionAttributeValues" : {
						        ":attrValue" : {
						            "N" : incomingObj['value'] + ""
						        }
						    }
						};

		requestObj['Key'][table.hashVal] = {'S': incomingObj['hash']};

		table.updateItem(requestObj,  function(err, data) {
			if(err) {
				callback(null, err);
			}
			else if(data) {
				callback(data);
			}
		});
	},

	/**
		Adds a new user
	*/
	addUser: function(incomingObj, primaryTable, secondaryTable, callback) {
		var dataObj = {};
		dataObj[primaryTable.hashVal] = {'S' : incomingObj['hash']};

		var updateFunction = this.updateScores;

		for(key in incomingObj) {
			if(key === 'hash' || key === 'name')
				continue;

			dataObj[key] = {'N':incomingObj[key]};

			for(other_keys in incomingObj) {
				if(other_keys === 'hash' || other_keys === 'name' || other_keys === key) 
					continue;

				var hashtagObject = {
					hash: other_keys,
					attribute: key,
					value: 1
				}

				updateFunction(hashtagObject, secondaryTable, function(data, err) {
					if(err) {
						console.log(err);
					}
					else
						console.log(data)
				});
			}
		}

		var itemParams = {Item: dataObj};
				
		primaryTable.putItem(itemParams, function(err, data) {
			if(err) {
				callback(null, err);
			}
			else if(data) {
				callback(itemParams.Item);
			}
		});
	}
}
