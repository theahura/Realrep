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


//initialize user (clear variables that need to be cleared and get the ID needed to access their stuff)
function requestUser() {
	if (global_friendsList.length == 0) {
		$("#ProfilePicture").attr("src", "../img/web1.gif");
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

		console.log("user initialized");

		fetchTopFive(function() {console.log("QWERQWERQWERQWERQWER")});
	}
}

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
				global_userTags = Object.keys(data);

				if (global_userTags.length < 3) {
					requestUser();
				}
				else {
					FBgetProfilePicture(global_nextID, function(url) {
						$("#ProfilePicture").attr("src", url);
					});

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse1").text(tag[0]);
					global_usedTags.push(tag[0]);

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse2").text(tag[0]);
					global_usedTags.push(tag[0]);

					var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
					$("#Endorse3").text(tag[0]);
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

					global_topFive = sortedKeys.slice(sortedKeys.length-5, sortedKeys.length);

					console.log("topFive fetched");
					console.log(global_topFive);
					
					callback();
				}
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






