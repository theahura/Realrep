/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

var usedTags
<<<<<<< HEAD
var userTags
=======
>>>>>>> 1afba40c997b285398959afd473bdd2f8b04045e
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
<<<<<<< HEAD
		var userTags = Object.keys(data);	//returns an array of the keys
		delete userTags.userId;	//PURGE THE USER ID
		console.log(data);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagOne").text(tag[0]);
		usedTags.push(tag[0]);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagTwo").text(tag[0]);
		usedTags.push(tag[0]);

		var tag = userTags.splice(Math.floor(Math.random()*userTags.length), 1)
		$("#HashtagThree").text(tag[0]);
		usedTags.push(tag[0]);
=======
		delete data.userId;	//PURGE THE USER ID
		var userTags = Object.keys(data);	//returns an array of the keys

		var deferredArray = [];

		for(key in userTags) {

			var deferred = new $.Deferred();

			socket.emit('clientToServer', {
				name: 'getHashtag', 
				hash: userTags[key]
			}, function(data) {
				jQuery.extend(userTags, data);
				deferred.resolve();
			});

			deferredArray.push(deferred);
		}

		//store information about file to dynamo through a server
		$.when.apply($, deferredArray).then(function() {

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
>>>>>>> 1afba40c997b285398959afd473bdd2f8b04045e
	});
}

function updateProfile(hashname, value) {
<<<<<<< HEAD
	var updatePackage = {
		hash: userTags.,

	}

	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: userHash
	}), function(data) {
		console.log(data);
	}
=======
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: nextID, 
		attribute: hashname, 
		value: value
	}, function(data, err) {
		socket.emit('clientToServer', {
			name: 'getProfile',
			hash: nextID
		}, function(data) {
			console.log(data[hashname]);
		})
	})
>>>>>>> 1afba40c997b285398959afd473bdd2f8b04045e
}






