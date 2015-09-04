/**
@author: Amol Kapoor
@date: 7-20-15
@version: 0.1

File storage module
*/

//AWS dependency - not sure if needed? 
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';


//Exposed functions
module.exports = {

	/**
		Stores patient data to dynamo. 

		@param: incomingObj
			@param: apptTime; time in milliseconds from epoch
			@paraM: patient; string; patientname
		@param: table; where to store
		@param: callback; what to do after
	*/
	storeData: function(incomingObj, table, callback) {
		var dataObj = {};

		for(key in incomingObj) {
			if(key === 'name' || !incomingObj[key] || incomingObj[key] === '')
				continue;

			if(key === 'apptDate') {
				dataObj[key] = {'N':incomingObj[key] + ""};
			}
			else {
				dataObj[key] = {'S':incomingObj[key]};
			}
		}

		var itemParams = {Item: dataObj};

		table.putItem(itemParams, function(err, data) {
			if(err) {
				callback(null, err);
			}
			else {
				callback(dataObj);
			}
	    });
	},

	/**
		Retrieves data of a specific user using table.query
		Pulls down last 5 days in order of most recent

		@param: incomingObj; {}
			@param: patient; string; the patient name (hash)
		@param: table; dynamo db table; where to get data
		@param: callback; function(data, err)
	*/
	retrieveData: function(incomingObj, table, callback) {

		if (typeof incomingObj.hashval === "string") {
			var hashvalArg = {"S": incomingObj.hashval};
		} else if (typeof incomingObj.hashval === "int") {
			var hashvalArg = {"N": incomingObj.hashval + ""};
		}

		if (typeof incomingObj.rangeval === "string") {
			var rangevalArg = {"S": incomingObj.rangeval};
		} else if (typeof incomingObj.hashval === "int") {
			var rangevalArg = {"N": incomingObj.rangeval + ""};
		}

		var keyCondExpArg = incomingObj.hashtype;

		if (rangevalArg) {
			table.query({
				ScanIndexForward: false,
				ExpressionAttributeValues: {
					":hashval": hashvalArg,
					":rangeval": rangevalArg
				},
				KeyConditionExpression: keyCondExpArg + " = :hashval"
			}, function(err, data)  {

				if(err) {
					callback(null, err);
				}
				else if(data.Items && data.Items.length > 0) {				
					callback(data.Items);
				}
				else {
					callback(null);
				}
			});
		} else {
			table.query({
				ScanIndexForward: false,
				ExpressionAttributeValues: {
					":hashval": hashvalArg,
				},
				KeyConditionExpression: keyCondExpArg + " = :hashval"
			}, function(err, data)  {

				if(err) {
					callback(null, err);
				}
				else if(data.Items && data.Items.length > 0) {				
					callback(data.Items);
				}
				else {
					callback(null);
				}
			});
		}
	},

	/**
		Deletes data from the requested table

		@param: incomingObj;
			@param: patient; hash value for db
			@param: apptDate; range value for db
		@param: table; where to search
		@param: callback; function(data, err)
	*/
	deleteData: function(incomingObj, table, callback) {
		console.log("HI")
		table.deleteItem({
			Key: {
				"patient": {"S": incomingObj.patient},
				"apptDate": {"N": incomingObj.apptDate}
			}
		}, function(err) {
			console.log(err)
			if(err) {
				callback(null, err);
			}
			else {
				callback();
			}
		});
	},

	/**
		Closes a patient injury and moves the data to an archive table

		@param: incomingObj; obj;
			@param: patient; string
		@param: dataTable; where to delete data from
		@param: archiveTable; where to move data to
		@param: callback; function(data, err, key); data is always null
	*/
	closePatientInjury: function(incomingObj, dataTable, archiveTable, callback) {

		this.retrieveData(incomingObj, dataTable, function(data, err) {
			if(err) {
				callback(null, err);
			}
			else if(data) {

				var closeTime = new Date().getTime() + "";

				var promiseArray = [];

				for(var formIndex in data) {

					promiseArray.push(new Promise(function(resolve, reject) {

						data[formIndex]['closeDate'] = {N: closeTime};

						var itemParams = {Item: data[formIndex]};

						archiveTable.putItem(itemParams, function(err, callbackData) {
							if(err) {
								reject();
							}
							else {
								resolve();
							}
					    });

					}));
					
				}

				Promise.all(promiseArray).then(function() {

					promiseArray = [];

					for(var formIndex in data) {
						promiseArray.push(new Promise(function(resolve, reject) {

							dataTable.deleteItem({
								Key: {
									"patient": {"S": data[formIndex].patient.S},
									"apptDate": {"N": data[formIndex].apptDate.N}
								}
							}, function(err) {
								console.log(err)
								if(err) {
									reject();
								}
								else {
									resolve();
								}
							});
						}));
					}

					Promise.all(promiseArray).then(function() {
						callback();
					}).catch(function() {
						callback(null, {message: "Server Error on loading promises -- 2"});
					});
				}).catch(function() {
					callback(null, {message: "Server Error on loading promises"});
				});
			}
		});
	}
}
