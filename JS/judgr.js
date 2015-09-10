/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for judging
*/

/**
	Tried to be commented by Derek "Obrin Dastek" Hong.
	This may have to be rewritten because there's a lot
	of dangling global vars and things are scattered about.
*/


// String Array
// Not currently in use, may never be used
var global_usedTags;

// String Array
// Used to store the tags associated with a user
// This is established once and persists throught the user's judging time
	// ie: once the array is initialized, tags will be removed one by one (compare to global_userData)
var global_userTags;

// Object Array
// Used to store the tag Objects of the user.
// NOTE: I think it also stores the userId of the user, which is just
	// a string, which is purged
// ## NOTE 2 ##: This is changed frequently throughout the user's juding time
	// DO NOT depend on the initial data to remain throughout the user's judging time
	// unlike global_userTags, global_userData is recalled from the server frequently.
	// SUB-NOTE: this also means you will have to purge userId and hashtag each time you recall
/** 
	tag Object:
	{
		tag: String,
		value: int 
	}
*/
var global_userData;

// String
// The userId from which the userData is obtained.
// NOTE: this is used to access user data in DynamoDB and also correlates to the facebook ID of a user
var global_nextID;

// String Array
// Stores the top five tags of a user based on a tag's value.
var global_topFive;


/**
	From the global list of friends, randomly chooses a user to judge.  If no more friends are found,
	goes to the "no friends" scenario.  Once a user ID is obtained, the various user variables
	(ie: userData, userTags, topFive) are reset.
*/
function requestUser() {
	if (global_friendsList.length == 0) {
		$("#ProfilePicture").attr("src", "../img/web1.png");
		$("#Endorse1").text("");
		$("#Endorse2").text("");
		$("#Endorse3").text("");

		console.log("no friends");
	}
	else {

		global_nextID = global_friendsList.splice(Math.floor(Math.random()*global_friendsList.length), 1)[0];

		global_usedTags = [];
		global_userTags = [];
		global_userData = {};
		global_topFive = [];

		initUserTags();

		console.log("user initialized");
	}
}

/**
	Populates the user variables based on userId obtained in requestUser().  

	Specifically, it populates userData, populates the initial userTags from 
	the userData (from which userId is purged), sets the profile picture in the 
	webpage, and sets the three tags on the webpage (this will eventually be 
	deprecated to one tag)

	Uses deferred array magic that Derek doesn't really understand
*/
function initUserTags() {
	socket.emit('clientToServer', {
			name: 'getProfile', 
			hash: global_nextID
		}, function(data) {
			
			delete data['userId']
			delete data['hashtag']

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
				// purge data that is unnessecary for the tags
				delete data['userId'];		// NOTE: this is stored in global_nextID
				delete data['hashtag'];		// I don't really know what this is, but sometimes it shows up
											// it may arise when we accidentally get hashtag data and not user data
				global_userTags = Object.keys(data);

				if (global_userTags.length < 3) {
					//##################### IDK IF THIS WORKS AS INTENDED YET
					requestUser();
				}
				else {

					if(global_userTags.length < 50) {
						global_userTags = global_userTags.concat(global_baseAssociations);
					}

					// Set the profile picture on the webpage to the FacebookLoginbook profile picture
					FBgetProfilePicture(global_nextID, function(url) {
						$("#ProfilePicture").attr("src", url);
					});

					//################# NEED TO ALSO GET THE NAME AND SET THAT

					// Set the tag on the webpage with a random tag from the list of gotten tags
					// remove that tag from the list
					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse1").text(tag[0]);
					global_usedTags.push(tag[0]);	//it's here, but we don't use it for anything...

					// TO BE DEPRECATED
					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse2").text(tag[0]);
					global_usedTags.push(tag[0]);

					// TO BE DEPRECATED
					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse3").text(tag[0]);
					global_usedTags.push(tag[0]);
				}
			});
		});
}

/**
	Sets global_topFive to the five tags of the current user with the greatest value.

	Note: this is an instance of the previously mentioned scenario
	where the global_userData is "frequently updated".
*/
function fetchTopFive(callback) {
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
				delete data['userId'];
				delete data['hashtag'];
				var dataObj = {};
				
				for(key in global_userData) {
					if('S' in global_userData[key]) {
						dataObj[key] = global_userData[key].S
					}
					else if('N' in global_userData[key])
						dataObj[key] = parseInt(global_userData[key].N)
				}

				global_userData = dataObj;

				// sorts in ascending order based on the tag Object's value
				var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

				global_topFive = sortedKeys.slice(sortedKeys.length-5, sortedKeys.length);

				console.log("topFive fetched");
				console.log(global_topFive);
				
				callback();
			});
		});
}

/**

##################### incomplete commenting
	Updates the value of some hashtag of the current user.  
	That hashtag hashname is changed by some number value.

	Database operations:
	- if the hashtag that was just updated is now in the topFive for this user,
		- add one to the hashtag.......

	@param: hashname;	String; the name of the hashtag to be changed
	@param: value; 		int;	the value by which hashname should be changed
*/
function updateProfile(hashname, value, callback) {
	socket.emit('clientToServer', {
		name: 'updateProfileScores',
		hash: global_nextID,
		attribute: hashname,
		value: value
	}, function(data, err) {

		//get the new top five relationships based on an updated pull of the database
		//important for calling updateProfile() mulitple times in a row
		fetchTopFive(function() {
			global_userData[hashname] += value; 

			if(global_userData[hashname] > global_userData[global_topFive[0]]) {

				var kickedHashtag = global_topFive[0];
				var newTopFive = hashname;
				
				for(key in global_topFive) {
					if(global_topFive[key] === kickedHashtag)
						continue; 

					//update other top5 keys
					socket.emit('clientToServer', {
						name: 'updateHashtagScores', 
						hash: global_topFive[key],
						attribute: newTopFive,
						value: 1
					}, function(data, err) {
						console.log(data);
						console.log(err);
					});

					socket.emit('clientToServer', {
						name: 'updateHashtagScores', 
						hash: global_topFive[key],
						attribute: kickedHashtag,
						value: -1
					}, function(data, err) {
						console.log(data);
						console.log(err);
					});

					//update the two scores to reflect change
					socket.emit('clientToServer', {
						name: 'updateHashtagScores', 
						hash: newTopFive,
						attribute: global_topFive[key],
						value: 1
					}, function(data, err) {
						console.log(data);
						console.log(err);
					});

					socket.emit('clientToServer', {
						name: 'updateHashtagScores', 
						hash: kickedHashtag,
						attribute: global_topFive[key],
						value: -1
					}, function(data, err) {
						console.log(data);
						console.log(err);
					});
				}
			}

			callback();
			console.log("profile updated")
		});
	});
}

 $(".judge").mouseenter(function() {
       $(this).animate({width: '150px'}, "fast");
    });
    $(".judge").mouseleave(function() {
       $(this).animate({width: '60px'}, "fast");;
    });
    $(".return").mouseenter(function() {
       $(this).animate({width: '150px'}, "fast");
    });
    $(".return").mouseleave(function() {
       $(this).animate({width: '60px'}, "fast");;
    });
    $("#FacebookLogin").mouseenter(function() {
       $(this).animate({width: '200px'}, "fast");
    });
    $("FacebookLogin").mouseleave(function() {
       $(this).animate({width: '200px'}, "fast");;
    });

    $(".hashtagbutton").mouseenter(function() {
       $(this).animate({width: '98%'}, "fast");
    });
    $(".hashtagbutton").mouseleave(function() {
       $(this).animate({width: '95%'}, "fast");;
    });

    $(".imagecontainer").mouseenter(function() {
       $(this).animate({width: '90%'}, "fast");
    });
    $(".imagecontainer").mouseleave(function() {
       $(this).animate({width: '85%'}, "fast");;
    });

    $(".divider1").mouseenter(function() {
       $(this).animate({height: '8%'}, "fast");
    });
    $(".divider1").mouseleave(function() {
       $(this).animate({height: '6%'}, "fast");;
    });






