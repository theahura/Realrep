/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Hooks to the actual UI
*/

//when you go to the judgr page, request a User
$('.view-judgr').click(function() {
	judgr_LoadUser();
});


$('.correlation-form').submit(function(event) {
	event.preventDefault();
	loadMap();
});


$( document ).ready( function() {
    $("#loginLogo").fadeIn("slow");
    $("#loginLogo").animate({width : "800px", height : "550px"});
    $(".flavortext").delay( 800 ).fadeIn(1500);
    $(this).scrollTop(0);
});

function scrollPage(panelID) {
    $('body').animate({
        scrollTop: $(panelID).offset().top
    }, 1000);
}

