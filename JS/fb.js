//on window load, verify the app
window.fbAsyncInit = function() {
	FB.init({
		appId      : '893485884040333',
		xfbml      : true,
		status     : true,
		version    : 'v2.4'
	});
};

//WHEN DAT BUTTON PRESS, LOG IN
$("#FacebookLogin").click(function() {
   FB.login(function(response) {
   		//once we've logged in, set the id of that user
   		setGlobalID();
   }, {scope: 'public_profile,user_friends'}) 
});

//SET THE ID OF THAT USER THAT JUST LOGGED IN
function setGlobalID() {
	FB.api("/me", function(response) {
		global_ID = response.id;
		login(global_ID);
	});
};

//asynchronously loads the javascript sdk
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));