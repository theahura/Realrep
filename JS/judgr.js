/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

var global_usedTags;
var global_userTags;
var global_userData;
var global_nextID;


function requestUser() {

	global_usedTags = [];
	global_userTags = [];

	//obtain the Facebook ID of a random friend from 
	//the list defined at the start of user login AND REMOVE
	//that friend so that you

	global_nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

	//set the profile picture to that user friend
	FBgetProfilePicture(global_nextID, function(url) {
		$("#ProfilePicture").attr("src", url);
	});

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: global_nextID
	}, function(data) {

		deferredArray = [];

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

			global_userTags = Object.keys(data);

			var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
			$("#HashtagOne").text(tag[0]);
			global_usedTags.push(tag[0]);

			var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
			$("#HashtagTwo").text(tag[0]);
			global_usedTags.push(tag[0]);

			var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
			$("#HashtagThree").text(tag[0]);
			global_usedTags.push(tag[0]);
		
		});
	});
}

function updateProfile(hashname, value, callback) {
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: global_nextID,
		attribute: hashname,
		value: value
	}, function(data, err) {
		console.log(err);
		console.log(data);
		callback();
	});
}






