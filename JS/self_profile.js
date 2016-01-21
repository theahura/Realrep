/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/


//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Loads the judgr page and help info
**/
$('.view-judgr').click(function() {
	changePage('judgrpage', null, function() {
		if(!currentLoadedFriend)
			judgr_loadUser();	
	});
}).hover(function() {
	$('.judgr-hint.profile-hint').slideToggle();
}, function() {
	$('.judgr-hint.profile-hint').slideToggle();
});


/**
	Loads the correlator page
**/
$('.view-correlator').click(function() {
	changePage('correlation-page');
}).hover(function() {
	$('.correlator-hint.profile-hint').slideToggle();
}, function() {
	$('.correlator-hint.profile-hint').slideToggle();
});

/**
	Loads the friend page (and friend network)
**/
$('.view-friendnetwork').click(function() {
	changePage('friend-network');
}).hover(function() {
	$('.friendnetwork-hint.profile-hint').slideToggle();
}, function() {
	$('.friendnetwork-hint.profile-hint').slideToggle();
});

/**
	Refreshes the home profile map
**/
$('.self-profile-page .refresh-map').click(function() {
	$('.' + mapReference['self-profile-page']).empty();
	loadProfileMap('.' + mapReference['self-profile-page'], global_ID);
}).hover(function() {
	$('.refresh-map-hint.profile-hint').slideToggle();
}, function() {
	$('.refresh-map-hint.profile-hint').slideToggle();
});

/**
	Loads the friend page (and friend network)
**/
$('.logout').click(function() {
	FBlogout(function() {
		location.reload();
	});
}).hover(function() {
	$('.logout-hint.profile-hint').slideToggle();
}, function() {
	$('.logout-hint.profile-hint').slideToggle();
});