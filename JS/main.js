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
	}
	else {
		loadUser();
	}
});

$('.endorsebutton').click(function() {
	var button = $('.hashtag'); 

	if(!$('.hashtag').html()) {
		return;
	}

	updateUser($('.hashtag').html(), 1);

	var global_userTags = currentLoadedFriend.fullHashtagList;

	if(global_userTags.length > 0) { 
		var tag = global_userTags[Math.floor(Math.random()*global_userTags.length)];
		$(button).html(tag);
	}
	else {
		$(button).html("");
	}
});

$('.passbutton').click(function() {
	var button = $('.hashtag'); 

	if(!$('.hashtag').html()) {
		return;
	}

	var global_userTags = currentLoadedFriend.fullHashtagList;

	if(global_userTags.length > 0) { 
		var tag = global_userTags[Math.floor(Math.random()*global_userTags.length)];
		$('.hashtag').html(tag);
	}
	else {
		$(button).html("");
	}
});

$('.correlation-form').submit(function(event) {
	event.preventDefault();
	loadMap();
});


