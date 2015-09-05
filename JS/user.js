/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/

function setUserProfile(data) {

	var sortedKeys = Object.keys(data).sort(function(a,b){return data[a]-data[b]});

	for(var i = 0; i < sortedKeys.length; i++) {
		$bar = $('#DynamicBarRowDefault').clone();
      	console.log($bar.attr('id'))

		$bar.attr('id', 'DynamicBarRow-' + i);
      	console.log($bar.attr('id'))

    	$bar.removeClass("hidden");
      	console.log($bar.attr('id'))

    	$bar.find('.hashtag-name').html(sortedKeys[i]);
      	console.log($bar.attr('id'))

    	$bar.find('.bar').css({'width':data[sortedKeys[i]]});
      	console.log($bar.attr('id'))

    	$(".friends-data > tbody:last-child").append($bar);

	}
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

		FBgetName(id, function(name) {
			global_name = name;
		});

		FBgetFriends(id, function(list) {
			global_friendsList = list; 
		});

		socket.emit('clientToServer', {
			name: 'checkUser', 
			hash: global_ID
		}, function(data) {
			loadData(data);
		});
	});

}