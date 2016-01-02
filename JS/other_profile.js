/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for other users
*/

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Switches back from the other profile page to the judgr page
*/
$('.otherprofile-to-judgr').click(function() {
	changePage('judgrpage', 'other-profile-page', {
		loadedFriend: currentLoadedFriend
	});
});
