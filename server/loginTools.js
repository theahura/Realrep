/**
@author: Amol Kapoor
@date: 6-30-15
@version: 0.1

User registration and login module 
*/

var bcrypt = require('bcrypt');


//Helper functions--------------------------------------------------------------------------------------------------

/**
	Takes username and password and generates a unique crypto hash that is extremely secure and uncrackable

	@param: username; string; username of the account
	@param: password; string; password for the account

	@return: userKey; unique key that allows a user to access data for their account
*/
function generateUserKey(username, password) {
	return username+password;
} 

/**
	Checks database if the current username is already taken. If so, sends newUserResponseFailure message. 

	@param: table; dynamodb table; where to search for data
	@param: username; string; the username to search for 
	@param: callback; function; the function to call when the search is finished and successful
*/
function checkUser(table, username, callback) {
	table.getItem({Key: {'username':{'S':username}}}, function(err, data)  {
		if(err) {
			callback(err);
		}
		else if(data.Item) {
			callback({message: 'Username already taken'}, 'appError');
		}
		else {
			callback();
		}
	});
}


/**
	Scans dynamo table for patient name and appointment dates, with a limit of 50 patients

	@param: patientsTable; dynamodb table; where to get data
	@param: callback; function(data, err)
*/
function patientScan(patientsTable, callback) {
	patientsTable.scan({
		ProjectionExpression: "patient,apptDate"
	}, function(err, dataFromScan) {
			if(err) {
			console.log(err);
			callback(null, err);
		} else {
			callback(dataFromScan);
		}
	});
}

//Exposed functions
module.exports = {
	/**
		Logs the user in and runs proper checks, sending info back as appropriate (either error or userkey)

		@param: table; dynamodb table; where to search for login info
		@param: incomingObj; {}
			@param: username; string; username for account login
			@param: password; string; password for account login
		@param: callback; function; the function to call if successfull login 
	*/
	loginUser: function(usersTable, patientsTable, incomingObj, callback) {

		// Read the item from the table
	  	usersTable.getItem({Key: {'username':{'S':incomingObj.username}}}, function(err, dataFromgetItem) {
	  		if(err) {
				console.log(err);
				callback(null, err);
			}
			else {

	  			if(Object.keys(dataFromgetItem).length === 0) {
	  				callback(null, {message: 'Username/Password incorrect'}, 'appError');
	  				return;
	  			}

	  			// bcrypt authenticates incoming password with userKey
	  			if(bcrypt.compareSync(incomingObj.password, dataFromgetItem.Item.userKey.S)) {

	  				dataObj = {};
	  				for(key in dataFromgetItem.Item) {
						dataObj[key] = {'S':dataFromgetItem.Item[key].S}
					}

					patientScan(patientsTable, function(dataFromScan, err) {
						dataObj['dataFromScan'] = dataFromScan;
						callback(dataObj);
					});
		    	}
		    	else {
					callback(null, {message: 'Username/Password incorrect'}, 'appError');
					return;
		    	}	
	  		}
	  	});
	},

	/**
		Creates new account and runs proper checks, sending info back as appropriate (either error or userkey)

		@param: table; dynamodb table; where to search for login info
		@param: incomingObj; {}
			@param: username; string; username for account login
			@param: password; string; password for account login
		@param: callback; function; the function to call if successfull login (default = loginResponseSuccess)
	*/
	regNewUser: function(table, username, userKey) {
		dataObj['username'] = {'S': username};
		dataObj['userKey'] = {'S': userKey};

		var itemParams = {Item: dataObj};

		table.putItem(itemParams, function(err, data) {
			if(err) {
				console.log(data, err);
			}
		});
	}
}
