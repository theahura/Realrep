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
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	retrieveData: function(incomingObj, table, callback) {
		var requestObj = {Key: {}};

		requestObj['Key'][table.hashVal] = {'S':incomingObj['hash']};
		requestObj['ReturnConsumedCapacity'] = 'TOTAL'

		table.getItem(requestObj, function(err, data)  {

			if(err) {
				console.log('got error')
				callback(null, err);
			}
			else if(data.Item) {
				console.log(data.ConsumedCapacity)
				callback(data.Item);
			}
			else {
				console.log('coundnt find anything')
				callback(null);
			}
		});
	},

	/**
		Checks if an attribute is under a root word

		@param: incomingObj; {}
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	checkRoot: function(incomingObj, table, callback) {
		var retrieveDataObj = {};

		retrieveDataObj['hash'] = incomingObj['checkRoot'];

		this.retrieveData(retrieveDataObj, table, function(data) {

			if(incomingObj['attribute'] in data || incomingObj['attribute'].toString() === data[table.hashVal]['S']) {
				callback();
			}
			else {
				callback({message: "Error: Attribute not found in root"});
			}
		});
	},

	/**
		Updates the scores of a specific data attribute with numeric values

		incomingObj must contain: 
			'hash': string -> the userID OR the hashtag
			'attribute': string -> the attribute being edited (so, for a user, which hashtag is being increased or decrased)
			'value': number
	*/
	updateScores: function(incomingObj, table, callback) {

		if(!incomingObj['value'])
			incomingObj['value'] = 0;
		else if(incomingObj['value'] > 1 || incomingObj['value'] < -1) {
			callback(null, {message:"Value too high or too low"});
			return;			
		}
		

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
						    },
						    "ReturnValues" : 'UPDATED_NEW'
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
		Updates the hashtag counts

		incomingObj: 
			attribute: the new key that's being updated

		hashtable: table being edited
		usertable: table used to grab user data	
		updateData: data related to the info being updated; can only have one key under attributes
			Attributes.'key'.N: new value of the updated data
	*/
	updateHashtags: function(incomingObj, hashtable, usertable, updateData) {
		//make sure the new value is above the arbitrary limit
		var updateFunction = this.updateScores;

		var newHashtag = Object.keys(updateData.Attributes)[0]
		var newHashtagValue = parseInt(updateData.Attributes[incomingObj['attribute']]['N']);

		if(newHashtagValue === Math.floor(incomingObj.friendLength/5)) {

			this.retrieveData(incomingObj, usertable, function(data, err) {

				if(err) {
					console.log(err);
					return;
				}

				if(data) {
					delete data['userId'];
					for(key in data) {

						if(key === newHashtag)
							continue;

						var updateObj = {
							hash: key,
							attribute: newHashtag,
							value: 1
						}

						updateFunction(updateObj, hashtable, function(data, err) {
							if(err) {
								console.log(err);
								return;
							}
						});

						var updateObj = {
							hash: newHashtag,
							attribute: key,
							value: 1
						}

						updateFunction(updateObj, hashtable, function(data, err) {
							if(err) {
								console.log(err);
								return;
							}
						});
					}
				}
			});
		} 
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

			dataObj[key] = {'N':incomingObj[key] + ""};

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
