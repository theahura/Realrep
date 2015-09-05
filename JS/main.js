/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Hooks to the actual UI
*/


//WHEN DAT BUTTON PRESS, LOG IN, MON
$("#FacebookLogin").click(function() {
	//user.js
	login();
});

//when you go to the judgr page, request a User
$('.temp').click(function() {
	requestUser();
});

//when you press the new user select button, call request user
$("#NewUserSelect").click(function() {
	if (global_friendsList.length == 0) {
		$("#ProfilePicture").attr("src", "../img/web1.gif");
		$("#HashtagOne").text("");
		$("#HashtagTwo").text("");
		$("#HashtagThree").text("");
	}
	else {
		requestUser();
	}
});

$('.hashtag').click(function() {
	console.log($(this).text());
	updateProfile();
});