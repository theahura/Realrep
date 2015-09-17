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
$('#view-judgr').click(function() {
	loadUser();
});

//when you press the new user select button, call request user
$("#NewUserSelect").click(function() {
	if (global_friendsList.length == 0) {
		$("#ProfilePicture").attr("src", "../img/web1.png");
		$("#Endorse1").html("");
		$("#Endorse2").html("");
		$("#Endorse3").html("");
	}
	else {
		loadUser();
	}
});

$('.endorsebutton').click(function() {
	var button = this; 

	if(!$(this).html()) {
		return;
	}

	updateUser($(this).html(), 1);

	var global_userTags = currentLoadedFriend.fullHashtagList;

	if(global_userTags.length > 0) { 
		var tag = global_userTags[Math.floor(Math.random()*global_userTags.length)];
		$(button).html(tag);
	}
	else {
		$(button).html("");
	}
});

$('#Pass').click(function() {
	var button = this; 
	if(global_userTags.length > 0) { 
		var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
		$(button).html(tag[0]);
		associatedTags = [];
	}
	else {
		$(button).html("");
	}
});

$('.correlation-form').submit(function(event) {
	event.preventDefault();
	loadMap();
});


