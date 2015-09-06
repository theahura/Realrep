/**
    @author: Amol Kapoor
    @date: 9-5-15
    @version: 0.1

    Description: All UI effects go here
*/


$('#ProfilePicture').click(function() { 
    $('.judgrpage').slideToggle();
    $('.other-profile-page').slideToggle(function() {
        loadOtherProfileMap();
    });
});


$('.temp').click(function() {
    $('.self-profile-page').slideToggle();  
    $('.judgrpage').slideToggle();
});

$('#view-judgr').click(function() {
    $('.self-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
})

$('.view-correlator').click(function() {
    $('.self-profile-page').slideToggle();
    $('.correlation-page').slideToggle();
});

function postLogin() {
    $('.loginpage').slideToggle();
    $('.self-profile-page').slideToggle();  
}
$('.FacebookLogin').click(function() {
    $('.self-profile-page').loadFirst();
});