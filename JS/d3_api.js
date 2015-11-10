/**
	@author: Amol Kapoor
	@date: 11-9-15
	@version: 0.1

	Description: Displays user data using d3
*/



/**
	Helper for ordering nodes on hover
*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

/**
	Creates a d3 force layout graph
*/
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
			.attr("width", $(DOMelement).width())
			.attr("height", $(DOMelement).height());
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
	    $('.svg-content-responsive').attr("width", $(DOMelement).width());
	    $('.svg-content-responsive').attr("height", $(DOMelement).height());
	});
}

/**
	Loads the profile map for a logged in user
*/
function loadProfileMap(DOMelement, id) {

	socket.emit('clientToServer', {
		name: 'getProfile',
		hash: id
	}, function(data, err) {

		var dataObj = stripDynamoSettings(data);

		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		var color = 'gray';
		var len = undefined;

		var nodes = [];
		var edges = [];

		FBgetName(id, function(name) {

			nodes.push({label: name, value: dataObj[sortedKeys[sortedKeys.length - 1]] + 20, color: 'black'});

			for(index in sortedKeys) {
				if(sortedKeys[index] === name)
					continue;

				index = parseInt(index);

				nodes.push({label: sortedKeys[index], value: dataObj[sortedKeys[index]], color: 'red'});

				edges.push({source: index + 1, target: 0});
			}

			var graph = {};

			graph.nodes = nodes;
			graph.links = edges;

			createGraph(DOMelement, graph);

		});
	});
}