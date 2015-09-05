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

	console.log("HELLO")

	nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

	console.log(nextID)

	//set the profile picture to that user friend
	FBgetProfilePicture(nextID, function(url) {
		console.log(url)
		$("#ProfilePicture").attr("src", url);
		console.log(url);
	});

	socket.emit('clientToServer', {
		name: 'getProfile', 
		hash: nextID
	}, function(data) {

		userTags = Object.keys(data);	//returns an array of the keys

		deferredArray = [];

		for(key in userTags) {

			deferred = new $.Deferred();
			deferredArray.push(deferred);

			socket.emit('clientToServer', {
				name: 'getHashtag', 
				hash: userTags[key]
			}, function(data) {
				jQuery.extend(userTags, data);
				deferred.resolve();
				console.log(deferred.state())
				console.log(deferredArray[0].state())
			});

		}

		$.when.apply($, deferredArray).then(function() {
			alert() 
			console.log(userTags)

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

function updateProfile(hashname, value) {
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: nextID,
		attribute: hashname,
		value: value
	}), function(data) {
		console.log(data);
	}
}





