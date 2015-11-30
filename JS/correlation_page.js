/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up data for viewing correlations
*/

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------

/**
	Sets up 'back' button to go from correlation page to home page
*/
$('.correlation-to-profile').click(function() {
    $('.correlation-page').slideToggle();
    $('.self-profile-page').slideToggle(function() {
    	loadProfileMap('.self_mapcontainer', global_ID);               
    });
});

/**
	Triggers new map loading
*/
$('.correlation-form').submit(function(event) {
	event.preventDefault();
	$('.correlation_mapcontainer').fadeOut(function() {
		$('.correlation_mapcontainer').empty();
		$('.correlation_mapcontainer').show();
		loadProfileMap('.correlation_mapcontainer', $('#SearchForCorrelation').val(), 'getHashtag');               
	});
});