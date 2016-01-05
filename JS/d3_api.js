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

	@param: DOMelement; html element; where the map is going to go
	@param: graph; {}
		nodes: list of nodes
		edges: list of edges
*/
function createGraph(DOMelement, graph) {

	//console.log(graph)

	var width = 800,
	    height = 800;

	var color = d3.scale.category20();

	var force = d3.layout.force()
	    .charge(-10000)
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
			.attr("height", $(DOMelement).height())

	var networkContainer = svg.append("g").attr("class", "networkContainer");

	force
		.nodes(graph.nodes)
		.links(graph.links)
		.start();

	var link = networkContainer.selectAll(".link")
		.data(graph.links)
	.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return 3; });

	var node = networkContainer.selectAll(".node")
		.data(graph.nodes)
	.enter().append("g")
		.attr("class", "node")
		.call(force.drag)
		.on("mouseover", function(d) {
			d3.select(this).moveToFront();

			d3.select(this).select(".node-circle").transition().attr("r", function(d) { return Math.min(d.size * 3, 200)});
		    d3.select(this).select(".node-text").transition().text(function(d) { 
		    	if(d.center)
		    		return d.label;
		    	else
		    		return d.label + " - " + d.value; 
		    });

		    fade(d, .1);
		})
		.on("mouseout", function(d) {
			d3.select(this).select(".node-circle").transition().attr("r", function(d) { return d.size});
		    d3.select(this).select(".node-text").transition().text(function(d) { 
				return d.label;
			});

			fade(d, 1);
		});


    var linkedByIndex = {};
    graph.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

	node.append('circle')
		.attr("r", function(d) { return d.size; })
		.attr("class", "node-circle")
		.style("fill", function(d) { return d3.rgb(d.color); })

	node.append("text")
	    .attr("text-anchor", "middle")
	    .attr("dy", 5)
		.attr("class", "node-text")
		.text(function(d) {	
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


	svg.call(zoom, networkContainer);

	function fade(d, opacity) {
        node.style("stroke-opacity", function(o) {
            thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
        });

        link.style("stroke-opacity", function(o) {
            return o.source === d || o.target === d ? 1 : opacity;
        });
    }

}


/**
	Handles zooming stuff. Specifically trigerrs zoom behavior. 

	@param: selection; d3 element (svg); passed in by select call
	@param: networkContainer; d3 element (g); element that contains the map in question 
**/
function zoom(selection, networkContainer) {
	console.log(networkContainer)
	console.log(selection)
	var innerzoom = d3.behavior.zoom()
    	.scaleExtent([.1, 10])
    	.on("zoom", function() {
    		zoomed(networkContainer);
    	});

	selection.call(innerzoom)
}

/**
	Explains how an element should behave on zoom behavior

	@param: container; d3 element (g); element that contains the map in question
**/
function zoomed(container) {
  	container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

/**
	Loads second layer nodes

	For each node in nodes, loads the second layer of nodes
	For each second layer node, checks if the node already exists in the previous layers - if it does, simply adds an edge;
	if not, adds a new node and an edge

	@param: nodes; []; list of nodes
	@param: reverseNodes; {}; list of nodes by name linking to their index in nodes[]
	@param: edges; []; list of edges
	@param: callback; function()
**/
function loadNodes(nodes, reverseNodes, edges, callback) {

	var deferredArray = [];
  
	for(node in nodes) {

		if(nodes[node].center) {
			continue;
		}

		deferred = new $.Deferred();


		socket.emit('clientToServer', {
			name: 'getHashtag',
			hash: nodes[node].label
		}, function(data, err) {
			
			var currentLoadingNodeLabel = data['hashtag']['S'];

			var dataObj = stripDynamoSettings(data);

			var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

			for(index in sortedKeys) {

				if(sortedKeys[index] === currentLoadingNodeLabel) 
					continue;


				if(reverseNodes[sortedKeys[index]] !== undefined) {

					if(nodes[reverseNodes[sortedKeys[index]]].layer <= 1)
						continue;

					edges.push({source: reverseNodes[sortedKeys[index]], target: reverseNodes[currentLoadingNodeLabel]});
				} else {

					nodes.push({
						layer: 2, 
						label: sortedKeys[index], 
						value: dataObj[sortedKeys[index]], 
						color: 'blue',
						size: Math.max(20, dataObj[sortedKeys[index]])
					});

					reverseNodes[sortedKeys[index]] = nodes.length - 1;

					edges.push({source: nodes.length - 1, target: reverseNodes[currentLoadingNodeLabel]});
				}
			}
			
			for(index in deferredArray) {
				if(deferredArray[index].state() === 'pending') {
					deferredArray[index].resolve();
					break;
				}			
			}
		});

	   deferredArray.push(deferred);
	}

	$.when.apply($, deferredArray).then(function() {
		if(callback) {
			callback();
		}
	});
}

/**
	Helper to load graph

	@param: name; String; node label
	@param: sortedKeys; list of tags associated with a base tag
	@param: dataObj; the original object listing values with keys
	@param: DOMelement; where to load the map
*/
function createGraph_helper(name, sortedKeys, dataObj, DOMelement) {

	var color = 'gray';
	var len = undefined;

	var nodes = [];
	var edges = [];
	var reverseNodes = {};

	nodes.push({
		layer: 0,
		label: name, 
		value: dataObj[sortedKeys[sortedKeys.length - 1]] + 20, 
		color: 'black', 
		center: true, 
		size: Math.max(40, dataObj[sortedKeys[sortedKeys.length - 1]] + 20)
	});

	reverseNodes[name] = 0;

	for(index in sortedKeys) {
		if(sortedKeys[index] === name)
			continue;

		index = parseInt(index);

		nodes.push({
			layer: 1, 
			label: sortedKeys[index], 
			value: dataObj[sortedKeys[index]], 
			color: 'red',
			size: Math.max(20, dataObj[sortedKeys[index]])
		});

		reverseNodes[sortedKeys[index]] = nodes.length - 1;

		edges.push({source: index + 1, target: 0});

	}

	loadNodes(nodes, reverseNodes, edges, function() {
		var graph = {};

		graph.nodes = nodes;
		graph.links = edges;

		createGraph(DOMelement, graph);
	});
}

/**
	Loads the profile map for a logged in user

	@param: DOMelement; html element; where to load the map
	@param: id; string; the hash call for the map to load
	@param: command; string; the program server call for the map to load
*/
function loadProfileMap(DOMelement, id, command) {

	if(!command)
		command = 'getProfile';

	socket.emit('clientToServer', {
		name: command,
		hash: id
	}, function(data, err) {

		var dataObj = stripDynamoSettings(data);

		var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

		if(command == 'getProfile') {
			FBgetName(id, function(name) {

				createGraph_helper(name, sortedKeys, dataObj, DOMelement);

			});	
		}
			
		else {
			createGraph_helper(id, sortedKeys, dataObj, DOMelement);
		} 

	});
}