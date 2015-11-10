/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for other users
*/

function otherprofile_loadOtherProfileMap() {
	loadProfileMap('.other_mapcontainer',currentLoadedFriend.id)
}

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Switches back from the other profile page to the judgr page
*/
$('.otherprofile-to-judgr').click(function() {
    $('.other-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
});
