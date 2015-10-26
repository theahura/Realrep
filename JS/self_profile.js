/**
	@author: Amol Kapoor
	@date: 9-5-15
	@version: 0.1

	Description: Sets up user data
*/

/**
	Loads the user data for a given logged in user. 

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
*/

/**
	Logs in a user to facebook. Loads the user's id, friends list. 

	@param: callback; type: function; what to do when both user id and friends list have loaded
*/
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

function createGraph(DOMelement, graph) {
	var width = 960,
	    height = 500;

	var color = d3.scale.category20();

	var force = d3.layout.force()
	    .charge(-120)
	    .linkDistance(30)
	    .size([width, height]);

	var svg = d3.select(DOMelement).append("svg")
	    .attr("width", width)
	    .attr("height", height);

	force
		.nodes(graph.nodes)
		.links(graph.links)
		.start();

	var link = svg.selectAll(".link")
		.data(graph.links)
	.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

	var node = svg.selectAll(".node")
		.data(graph.nodes)
	.enter().append("circle")
		.attr("class", "node")
		.attr("r", 5)
		.style("fill", function(d) { return color(d.group); })
		.call(force.drag);

	node.append("title")
		.text(function(d) { return d.name; });

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });

		node.attr("cx", function(d) { return d.x; })
		    .attr("cy", function(d) { return d.y; });
	});	
}

/**
	Loads the profile map for a logged in user
*/
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

		nodes.push({label: global_name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 1});

		for(index in sortedKeys) {
			if(sortedKeys[index] === global_name)
				continue;

			index = parseInt(index);

			nodes.push({label: dataObj[sortedKeys[index]] + " - " + sortedKeys[index], value: dataObj[sortedKeys[index]]});
			edges.push({source: index + 1, target: 0});
		}

		var graph = {};

		graph.nodes = nodes;
		graph.links = edges;

		createGraph("#ProfileNetwork",graph);

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


