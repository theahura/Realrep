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
	Switches back from the other profile page to other pages
*/
$('.otherprofile-to-judgr').click(function() {
	changePage('judgrpage');
});

$('.otherprofile-to-profile').click(function() {
	changePage('self-profile-page');
});

$('.otherprofile-to-correlations').click(function() {
	changePage('correlation-page');
});

$('.otherprofile-to-friends').click(function() {
	changePage('friend-network');
});

$('.other-profile-page .refresh-map').click(function() {
	$('.' + mapReference['other-profile-page']).empty();
	loadProfileMap('.' + mapReference['other-profile-page'], currentLoadedFriend.id);
});