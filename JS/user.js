/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/

function setUserProfile(data) {

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

function loadData(data) {
	if(!jQuery.isEmptyObject(data)) {
		//If a user has previous data, load it
	

		//mainUI.js
		postLogin();
	}
	else {
		getInitTags();
	}
}

function login() {
	//fb.js
	FBlogin(function(id) {
		global_ID = id;

		FBgetName(id, function(name) {
			global_name = name;
			$('.profile label').html(global_name);
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

function loadProfileMap() {

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
				if(data[key].N === '0')
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

			nodes.push({id: index + 1, label: dataObj[sortedKeys[index]], title: sortedKeys[index], value: dataObj[sortedKeys[index]]});
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
      		network.focus(0, {scale: 1.0, offset: {y:20}});
      	});
	});
}

$(".judge").mouseenter(function() {
       $(this).animate({width: '150px'}, "fast");
 });
$(".judge").mouseleave(function() {
   $(this).animate({width: '60px'}, "fast");;
});
$(".return").mouseenter(function() {
   $(this).animate({width: '150px'}, "fast");
});
$(".return").mouseleave(function() {
   $(this).animate({width: '60px'}, "fast");;
});
