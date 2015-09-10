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
	requestUser();
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
		requestUser();
	}
});

$('.endorsebutton').click(function() {
	var button = this; 

	if(!$(this).html()) {
		return;
	}

	updateProfile($(this).html(), 1, function() {	
		console.log("Updated");
	});

	if(global_userTags.length > 0) { 
		var tag = global_userTags.splice(Math.floor(Math.random()*global_userTags.length), 1)
		$(button).html(tag[0]);
		global_usedTags.push(tag[0]);

		associatedTags = [];
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
		global_usedTags.push(tag[0]);

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


