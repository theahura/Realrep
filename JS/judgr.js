/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/


//Request a user -> returns a user id with all hashtag data
//For each hashtag, pull down hashtag data -> returns hashtag association data
//Set up a list of hashtags composed of the users' data, the hashtag association data, (and some random hashtags)
//From the list, select three hashtags at random and load them
//On user select for a hashtag, update the userprofile score for that hashtag
//On user select for a hashtag, clear the hashtag clicked and load another
//On user select for a hashtag, check if hashtag update is in top five and update association accordingly


var global_usedTags;
var global_userTags;
var global_userData;
var global_nextID;
var global_topFive;


function requestUser() {

	if (global_friendsList.length == 0) {
		$("#ProfilePicture").attr("src", "../img/web1.gif");
		$("#HashtagOne").text("");
		$("#HashtagTwo").text("");
		$("#HashtagThree").text("");
	}
	else {

		global_nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

		global_usedTags = [];
		global_userTags = [];
		global_userData = {};

		socket.emit('clientToServer', {
			name: 'getProfile', 
			hash: global_nextID
		}, function(data) {
			
			global_userData = data; 

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
				delete data.userId;
				delete data.hashtag;
				global_userTags = Object.keys(data);

				if (global_userTags.length < 3) {
					requestUser();
				}
				else {
					FBgetProfilePicture(global_nextID, function(url) {
						$("#ProfilePicture").attr("src", url);
					});

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#HashtagOne").text(tag[0]);
					global_usedTags.push(tag[0]);

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#HashtagTwo").text(tag[0]);
					global_usedTags.push(tag[0]);

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#HashtagThree").text(tag[0]);
					global_usedTags.push(tag[0]);

					var dataObj = {};
					
					for(key in global_userData) {
						if('S' in global_userData[key]) {
							dataObj[key] = global_userData[key].S
						}
						else if('N' in global_userData[key])
							dataObj[key] = parseInt(global_userData[key].N)
					}

					global_userData = dataObj;

					var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

					global_topFive = sortedKeys.splice(sortedKeys.length, -5);
				}
			});
		});
	}
}

function updateProfile(hashname, value, callback) {
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: global_nextID,
		attribute: hashname,
		value: value
	}, function(data, err) {

		global_userData[hashname] += value; 

		if(global_userData[hashname] > global_userData[global_topFive[0]]) {

			var kickedHashtag = global_topFive[0];
			var newTopFive = hashname;

			for(key in global_topFive) {
				//update the two scores to reflect change
				socket.emit('clientToServer', {
					name: 'updateHashtagScores', 
					hash: newTopFive,
					attribute: key,
					value: 1
				}, function(data, err) {
					console.log(data);
					console.log(err);
				});

				socket.emit('clientToServer', {
					name: 'updateHashtagScores', 
					hash: kickedHashtag,
					attribute: key,
					value: -1
				}, function(data, err) {
					console.log(data);
					console.log(err);
				});
			}
			
			var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

			global_topFive = sortedKeys.splice(sortedKeys.length, -5);

		}

		callback();
	});
}






