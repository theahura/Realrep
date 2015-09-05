/**
    @author: Amol Kapoor
    @date: 9-5-15
    @version: 0.1

    Description: All UI effects go here
*/


$('#ProfilePicture').click(function() { 
    $('.judgrpage').slideToggle();
    $('.other-profile-page').slideToggle();
});


$('.temp').click(function() {
    $('.self-profile-page').slideToggle();  
    $('.judgrpage').slideToggle();

});


function postLogin() {
    $('.loginpage').slideToggle();
    $('.self-profile-page').slideToggle();  
}