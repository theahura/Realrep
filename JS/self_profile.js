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

/**
	Creates a d3 force layout graph
*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function createGraph(DOMelement, graph) {

	var width = 800,
	    height = 800;

	var color = d3.scale.category20();

	var force = d3.layout.force()
	    .charge(-1000)
	    .linkDistance(150)
	    .size([width, height]);

	var svg = d3.select(DOMelement)
   		.append("svg")
   			//responsive SVG needs these 2 attributes and no width and height attr
   			.attr("preserveAspectRatio", "xMinYMin meet")
   			.attr("viewBox", "0 0 " + width + " " + height)
   			//class to make it responsive
   			.classed("svg-content-responsive", true)
			.attr("width", $('.svg-container').width())
			.attr("height", $('.svg-container').height());
	force
		.nodes(graph.nodes)
		.links(graph.links)
		.start();

	var link = svg.selectAll(".link")
		.data(graph.links)
	.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return 3; });

	var node = svg.selectAll(".node")
		.data(graph.nodes)
	.enter().append("g")
		.attr("class", "node")
		.call(force.drag)
		.on("mouseover", function(d) {
			d3.select(this).moveToFront();
			d3.select(this).select(".node-circle").transition().attr("r", function(d) { return d.value * 5});
		    d3.select(this).select(".node-text").transition().text(function(d) { return d.label + " - " + d.value; });
		})
		.on("mouseout", function(d) {
			d3.select(this).select(".node-circle").transition().attr("r", function(d) { return d.value + 5});
		    d3.select(this).select(".node-text").transition().text(function(d) { 
		    	if(!d.name) 
					return d.value; 
				
				return d.label;
			});
		});

	node.append('circle')
		.attr("r", function(d) { return d.value + 5})
		.attr("class", "node-circle")
		.style("fill", function(d) { return d3.rgb(d.color); })

	//http://stackoverflow.com/questions/24388982/text-not-showing-in-forcelayout-d3js-but-present-in-view
	//this needs to be in a group, not attached to the same thing
	node.append("text")
	    .attr("text-anchor", "middle")
		.attr("class", "node-text")
		.text(function(d) {	
			if(!d.name) 
				return d.value;
			
			return d.label; 
		});

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });

		node
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	});	

	$(window).on("resize", function() {
	    $('.svg-content-responsive').attr("width", $('.svg-container').width());
	    $('.svg-content-responsive').attr("height", $('.svg-container').height());
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

		var dataObj = stripDynamoSettings(data);

		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];

		nodes.push({label: global_name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 20, color: 'black'});

		for(index in sortedKeys) {
			if(sortedKeys[index] === global_name)
				continue;

			index = parseInt(index);

			nodes.push({label: sortedKeys[index], value: dataObj[sortedKeys[index]], color: 'red'});

			edges.push({source: index + 1, target: 0});
		}

		var graph = {};

		graph.nodes = nodes;
		graph.links = edges;

		createGraph(".mapcontainer",graph);
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


