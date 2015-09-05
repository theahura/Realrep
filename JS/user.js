function setUserProfile(data) {
	console.log(data);
}

function loadData(data) {

	if(data) {
		//If a user has previous data, load it
		setUserProfile(data);

		//mainUI.js
		postLogin();
	}
	else {
		//Otherwise, create new data for the user
		var incomingObj = {
			name: 'addUser',
			hash: global_ID
		}

		for(var i in [0, 1, 2, 3, 4]) {
			var key = prompt("Describe yourself in one word:");
			incomingObj[key] = 10;
		}

		socket.emit('clientToServer', incomingObj, function(data, err) {
			if(err) {
				console.log(err);
			}
			else {
				setUserProfile(data);
				
				//mainUI.js
				postLogin();
			}
		});
	}
}

function login() {
	//fb.js
	FBlogin(function(id) {
		global_ID = id;

		socket.emit('clientToServer', {
			name: 'checkUser', 
			hash: global_ID
		}, function(data) {
			loadData(data);
		});
	});

}