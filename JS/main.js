<<<<<<< HEAD
//WHEN DAT BUTTON PRESS, LOG IN
$("#FacebookLogin").click(function() {
	FBlogin(function(id) {
		global_ID = id;
	});
});
=======

function login(userId) {
	socket.emit('clientToServer', {
		name: 'checkUser', 
		hash: userId
	}, function(data) {

		if(data) {
			//set data points 
		}

		
	
	});
}

function testBackend() {

	var incomingObj = {
		name: 'addUser',
		hash: 'amolkapoor',
		video_games: '10',
		new_jersey: '10',
		columbia: '10', 
		nintendo: '10',
		cats: '10'
	};

	socket.emit("clientToServer", incomingObj, function(data, err) {
		console.log(data);
		console.log(err);

		incomingObj = {
			name: 'getProfile', 
			hash: 'amolkapoor'
		}

		socket.emit("clientToServer", incomingObj, function(data, err) {
			console.log(data);
			console.log(err);

			incomingObj = {
				name: 'getHashtag', 
				hash: 'video_games'
			}

			socket.emit("clientToServer", incomingObj, function(data, err) {
				console.log(data);
				console.log(err);

				incomingObj = {
					name: 'updateProfileScores', 
					hash: 'amolkapoor',
					attribute: 'video_games', 
					value: 1
				}

				socket.emit("clientToServer", incomingObj, function(data, err) {
					console.log(data);
					console.log(err);

					incomingObj = {
						name: 'updateProfileScores', 
						hash: 'amolkapoor',
						attribute: 'nintendo', 
						value: -1
					}

					socket.emit("clientToServer", incomingObj, function(data, err) {
						console.log(data);
						console.log(err);
					});
				});
			});
		});
	});
}
>>>>>>> c67e52f4aa81c05a138b5980475e209bc16f8e48
