/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

var usedTags
var userTags
var nextID


function requestUser() {

	usedTags = [];

	//obtain the Facebook ID of a random friend from 
	//the list defined at the start of user login AND REMOVE
	//that friend so that you

	nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

	//set the profile picture to that user friend
	FBgetProfilePicture(nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	});

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {

		deferredArray = [];

		console.log(data)

		for(key in data) {

			deferred = new $.Deferred();
			deferredArray.push(deferred);

			socket.emit('clientToServer', {
				name: 'getHashtag', 
				hash: key
			}, function(data_2) {

				var temptags = Object.keys(data_2)

				jQuery.extend(data, data_2);

				for(key in deferredArray) {
					if(deferredArray[key].state() !== 'resolved') {
						deferredArray[key].resolve();
					}
				}
			});
		}

		$.when.apply($, deferredArray).then(function() {

			userTags = Object.keys(data);

			var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
			$("#HashtagOne").text(tag[0]);
			usedTags.push(tag[0]);

			var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
			$("#HashtagTwo").text(tag[0]);
			usedTags.push(tag[0]);

			var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
			$("#HashtagThree").text(tag[0]);
			usedTags.push(tag[0]);
		
		});
	});
}

function updateProfile(hashname, value, callback) {
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: nextID,
		attribute: hashname,
		value: value
	}, function(data, err) {
		console.log(err);
		console.log(data);

		callback();
	});
}






