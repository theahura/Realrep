/**
	@author: Amol Kapoor
	@date: 1-4-16
	@version: 0.1

	Description: Lists friends data and links to their maps
*/

/**
	Loads profile pictures and names for the friend network
**/
function friendnetwork_loadFriends() {
	for(index in global_friendsListUnmodified) {

		var loadProPic = function (specific_index) {
			FBgetProfilePicture(global_friendsListUnmodified[specific_index], function(url) {
		        $("." + global_friendsListUnmodified[specific_index] + "_img").attr("src", url);
		    });
		}

		var loadName = function(specific_index) {
			FBgetName(global_friendsListUnmodified[specific_index], function(name) {
		    	$("." + global_friendsListUnmodified[specific_index] + "_name").html(name);
		    });
		}

		$('.friend-network .friend-container').append("<li class=\"button\" id=\"" + global_friendsListUnmodified[index] + "\"> <img class=\"" + global_friendsListUnmodified[index] + "_img\"> </img> <div class=\"" + global_friendsListUnmodified[index] + "_name\"> TEST TEXT </div> </li>");
		loadProPic(index);
		loadName(index);
	}

	setImageClick();
}

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Sets up 'back' button to go from network page to home page
*/
$('.friendnetwork-to-profile').click(function() {
	changePage('self-profile-page', 'friend-network', global_ID);
});

/**
	Sets what happens when you click a friend (moves to other friend page and loads map)
**/
function setImageClick() {

	$('.' + mapReference['other-profile-page']).empty();

	/**
		Sends picture to other-profile-panel map loading
	*/
	$('.friend-network .friend-container li').click(function(event) { 
		
		var fbID = $(this).context.id;

		socket.emit('clientToServer', {
			name: 'getProfile',
			hash: fbID
		}, function(data, err) {

			if(err) {
				alert(err);
				console.log(err);
				return;
			}

			if(data) {

				changePage('other-profile-page', 'friend-network', fbID);

	    		judgr_loadUser(fbID);

			} else {
				alert("User does not have any data stored");
			}
		});
	    
	});
}