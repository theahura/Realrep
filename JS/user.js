/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/

function setUserProfile(data) {

	delete data['userId']

	var sortedKeys = Object.keys(data).sort(function(a,b){return data[a]-data[b]});

	console.log(data)
	console.log(data[sortedKeys])
	console.log(data[sortedKeys.length - 1])

	var max = data[sortedKeys[sortedKeys.length - 1]];
	console.log(max)
	var divisor = max/100;

	for(var i = 0; i < sortedKeys.length; i++) {

    	$(".friends-data > tbody:last-child").append(
    		"<tr id=\"DataBar-" + i + "\">"+
				"<td class=\"hashtag-name\">" + 
				"</td>"+
				"<td class=\"bar-container\">"+
					"<div class=\"bar\"> </div>"+
				"</td>"+
			"</tr>");

    	$('#DataBar-' + i).find('.hashtag-name').html(sortedKeys[i]);
    	$('#DataBar-' + i).find('.bar').width(data[sortedKeys[i]]/divisor + "%");
	}
}

function loadData(data) {
	if(!jQuery.isEmptyObject(data)) {
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
			var dataObj = {};

			for(key in data) {
				if('S' in data[key]) {
					dataObj[key] = data[key].S
				}
				else if('N' in data[key])
					dataObj[key] = parseInt(data[key].N)
			}

			loadData(dataObj);
		});
	});

}