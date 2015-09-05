function FBlogin(callback) {
	FB.login(function(response) {
   		FB.api("/me", function(response) {
			callback(response.id);
		});
   }, {scope: 'public_profile,user_friends'});
};

function getName(id, callback) {
	var query = "/" + id;
	FB.api(query, function(response) {
		callback(response.name);
		console.log(response.name);
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

//on window load, verify the app
window.fbAsyncInit = function() {
	FB.init({
		appId      : '893485884040333',
		xfbml      : true,
		status     : true,
		version    : 'v2.4'
	});
};


