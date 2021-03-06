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
	var userKey = bcrypt.hashSync(password + username, 10);

	return userKey;
} 

//Exposed functions
module.exports = {
	/**
		Creates new account and runs proper checks, sending info back as appropriate (either error or userkey)

		@param: table; dynamodb table; where to search for login info
		@param: incomingObj; {}
			@param: username; string; username for account login
			@param: password; string; password for account login
		@param: callback; function; the function to call if successfull login (default = loginResponseSuccess)
	*/
	regNewUser: function(table, username, password, hashtags) {

		var userKey = generateUserKey(username, password);

		dataObj = {};

		dataObj['username'] = {'S': username};
		dataObj['userKey'] = {'S': userKey};

		dataObj['']

		var itemParams = {Item: dataObj};

		table.putItem(itemParams, function(err, data) {
			if(err) {
				console.log(data, err);
			}
		});
	},
	/**
		Checks database if the current username is already taken. If so, sends newUserResponseFailure message. 
	*/
	checkUser: function(incomingObj, table, callback) {
		table.getItem({Key: {'userId':{'S':incomingObj['hash']}}}, function(err, data)  {
			if(err) {
				callback(err);
			}
			else if(data.Item) {
				callback(data.Item);
			}
			else {
				callback(false);
			}
		});
	}
}
