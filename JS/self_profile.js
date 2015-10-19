/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/

function selfprofile_setUserProfile(data) {

	delete data['userId']

	var sortedKeys = Object.keys(data).sort(function(a,b){return data[a]-data[b]});

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

    	if (data[sortedKeys[i]]/divisor < 8) {
    		$('#DataBar-' + i).find('.bar').html(data[sortedKeys[i]]);
    	}
    	else {
    		$('#DataBar-' + i).find('.bar').html(data[sortedKeys[i]] + " rep");
    	}

    	$('#DataBar-' + i).find('.hashtag-name').html(sortedKeys[i]);
    	$('#DataBar-' + i).find('.bar').width(data[sortedKeys[i]]/divisor + "%");
	}
}

function selfprofile_login(callback) {
	//fb.js
	FBlogin(function(id) {

		global_ID = id;

		var deferred_name = new $.Deferred();
		var deferred_friends = new $.Deferred();

		FBgetName(id, function(name) {
			global_name = name;
			$('.profile label').html(global_name);

			socket.emit('clientToServer', {
				name: 'checkUser', 
				hash: global_ID
			}, function(data) {
				
				var dataObj = stripDynamoSettings(data);

				deferred_name.resolve();
			});
		});

		FBgetFriends(id, function(list) {

			global_friendsList = list.slice(0); 
			global_friendsListUnmodified = list.slice(0);
			
			deferred_friends.resolve();
		});

		$.when.apply(deferred_name, deferred_friends).done(function() {

			if(callback)
				callback();

		});
	});
}

function selfprofile_loadProfileMap() {

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: global_ID
	}, function(data, err) {

		var dataObj = {};

		delete data['userId'];
		delete data['hashtag'];

		for(key in data) {
			if('S' in data[key]) {
				dataObj[key] = data[key].S
			}
			else if('N' in data[key]) {
				if(parseInt(data[key].N) <= 0)
					continue;

				dataObj[key] = parseInt(data[key].N)			
			}
		}

		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];

		nodes.push({id: 0, label: global_name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

		for(index in sortedKeys) {
			if(sortedKeys[index] === global_name)
				continue;

			index = parseInt(index);

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]] + " - " + sortedKeys[index], value: dataObj[sortedKeys[index]]});
			edges.push({from: index + 1, to: 0});
		}


	    // Instantiate our network object.
	    var container = document.getElementById('ProfileNetwork');
	    var data = {
	        nodes: nodes,
	        edges: edges
	    };
	    var options = {
	        nodes: {
	            shape: 'dot',
	          	scaling:{
	            	label: {
	              		min:50,
	              		max:200
	            	}
	          	}
        	}
    	};

      	var network = new vis.Network(container, data, options);

      	network.on("afterDrawing", function() {
      		if(network.getScale() !== 1.0)
      			network.focus(0, {scale: 1.0, offset: {y:20}});
      	});
	});
}

//----------------------------------------------------------------------------------------------------------------------------
//UI GOES HERE
//----------------------------------------------------------------------------------------------------------------------------


$('.view-judgr').click(function() {
    $('.self-profile-page').slideToggle();
    $('.judgrpage').slideToggle();
	judgr_loadUser();
})

$('.view-correlator').click(function() {
    $('.self-profile-page').slideToggle();
    $('.correlation-page').slideToggle();
});

