/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/


/**
	Logs in a user to facebook. Loads the user's id, friends list. 

	@param: callback; type: function; what to do when both user id and friends list have loaded
*/
function selfprofile_login(callback) {
	//fb.js
	FBlogin(function(id, friendsList_scope) {

		if(!id) {
			callback(false);
			return;
		}

		if(!friendsList_scope) {
			alert("Error: Friends list access not given.")
			callback(false);
			return;
		}

		global_ID = id;

		var deferred_name = new $.Deferred();
		var deferred_friends = new $.Deferred();

		FBgetName(id, function(name) {
			global_name = name;
			$('.profile label').html(global_name);

			socket.emit('clientToServer', {
				name: 'checkUser', 
				hash: global_ID
			}, function(data) {
				
				var dataObj = stripDynamoSettings(data);

				deferred_name.resolve();
			});
		});

		FBgetFriends(id, function(list) {

			global_friendsList = list.slice(0); 
			global_friendsListUnmodified = list.slice(0);

			socket.emit('clientToServer', {
				name: 'updateFriendsLength', 
				hash: global_ID,
				attribute: global_friendLengthKey,
				value: global_friendsListUnmodified.length
			}, function(data, err) {
				
				if(err) {
					console.log(err);
				}

				deferred_name.resolve();
			});			
		});

		$.when.apply(deferred_name, deferred_friends).done(function() {

			if(callback)
				callback(true);

		});
	});
}



//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Loads the judgr page
**/
$('.view-judgr').click(function() {
	changePage('judgrpage', null, function() {
		if(!currentLoadedFriend)
			judgr_loadUser();	
	});
});

/**
	Loads the correlator page
**/
$('.view-correlator').click(function() {
	changePage('correlation-page');
});

/**
	Loads the friend page (and friend network)
**/
$('.view-friendnetwork').click(function() {
	changePage('friend-network');
});

/**
	Refreshes the home profile map
**/
$('.self-profile-page .refresh-map').click(function() {
	$('.' + mapReference['self-profile-page']).empty();
	loadProfileMap('.' + mapReference['self-profile-page'], global_ID);
});

/**
	Loads the friend page (and friend network)
**/
$('.logout').click(function() {
	FBlogout(function() {
		location.reload();
	});
});