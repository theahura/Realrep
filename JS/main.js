//WHEN DAT BUTTON PRESS, LOG IN
$("#FacebookLogin").click(function() {
	FBlogin(function(id) {
		global_ID = id;
	});
});