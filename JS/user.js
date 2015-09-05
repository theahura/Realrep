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