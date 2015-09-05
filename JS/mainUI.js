
$("#LoginButton").click(function showInputLogin() {
    $("#NewUserButton").css("display", "none");
    $("#LoginButton").css("display", "none");
    $("#SubmitLogin").css("display", "inline");
    $("#UsernameField").css("display", "inline");
    $("#PasswordField").css("display", "inline");
    $("#Cancel").css("display", "inline");

    $("#UsernameField").focus();
});


$("#Cancel").click(function hideInputLogin() {
    $("#NewUserButton").css("display", "inline");
    $("#LoginButton").css("display", "inline");
    $("#SubmitLogin").css("display", "none");
    $("#UsernameField").css("display", "none");
    $("#PasswordField").css("display", "none");
    $("#Cancel").css("display", "none");

});

$('#NewUserButton, #CancelUserCreator').click(function toggleUserCreator() {
    $('#FlavorText, #UserCreator').slideToggle('fast');
});

$('#terms').click(function() { alert("We own you")});

$('#privacy').click(function() { alert("We have none, sucker")});

$('#GetStartedButton').click(function() {
    this.parentNodes.submit();    
});

$('#logo').click(function() {
    location.reload();
});


//-----------------------------
$("#AddCloud").click(function(){
    $(".new-cloud-panel").fadeIn();
});

$(".new-cloud-cover").click(function(){
    $(".new-cloud-panel").fadeOut();
});

