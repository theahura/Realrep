3/**
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
function createGraph(DOMelement, graph, piChartElement, otherInfoElement) {
	//Sets the initial graph parameters to the width and height of the screen
	var width = Math.floor($(DOMelement).width()),
	    height = Math.floor($(DOMelement).height());

	//Sets the root node and its location relative to parent
	var root = graph.nodes[0];
	root.x = width / 2;
 	root.y = height / 2;
  	root.fixed = true;

  	//Creates an SVG element...
	var svg = d3.select(DOMelement)
   		.append("svg")
			.attr("viewBox", "0 0 " + $(DOMelement).width() + " " + $(DOMelement).height() )
            .attr("preserveAspectRatio", "xMidYMid meet");

    //and apppends a grouping obj that will hold the rest of the map
	var networkContainer = svg.append("g").attr("class", "networkContainer");
  	
  	//initializes the force graph
	var force = d3.layout.force()
	    .charge(-10000)
	    .linkDistance(200)
	    .size([width, height])
		.nodes(graph.nodes)
		.links(graph.links)
		.start();

	//Generates the links and nodes in the force graph
	var link = networkContainer.selectAll(".link")
		.data(graph.links)
	.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return 3; });

	//nodes also have special params set for mouse over functionality and mouse click functionality
	//Specifically, they fade and grow bigger on hover, displaying value if layer === 1;
	//and they load correlation map if they are clicked
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
		    	else {
		    		return d.layer === 1 ? d.label + " - " + d.value : d.label;
		    	}
		    });

		    fade(d, .1);
		})
		.on("mouseout", function(d) {
			d3.select(this).select(".node-circle").transition().attr("r", function(d) { return d.size});
		    d3.select(this).select(".node-text").transition().text(function(d) { 
				return d.label;
			});

			fade(d, 1);
		})
		.on("click", function(d) {
			$('.correlation_mapcontainer').empty();
			
			changePage('correlation-page', null, function() {
				loadProfileMap('.correlation_mapcontainer', d.label, 'getHashtag');
			});
		});

	//Draws the rest of the node class
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

	//Defines how the graph moves
	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });

		node
			.attr("transform", function(d) { 
				//if(d.center)
					//return "translate(" + width/2 + "," + height/2 + ")";
				return "translate(" + d.x + "," + d.y + ")"; 
			});
	});	

	//makes the graph movable
	svg.call(zoom, networkContainer);

	//Sets up graph linking objects for fading, and calls respectively
	var linkedByIndex = {};
    
    graph.links.forEach(function(d) {
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });

    /**
		Returns whether two nodes are connected

		@param: a; d3 node; the first node 
		@param: b; d3 node; the second node
    **/
    function isConnected(a, b) {
        return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
    }

    /**
		Sets stroke-opacity of all nodes and links attached to d to opacity 
    **/
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


	/**
		Loads the data in the sidebar

		@param: baseNode; d3 node; the node that is used as the root of the data being loaded
		@param: piChartElement; html element; where the pi chart is going to go
		@param: otherInfoElement; html element; where the other data section goes
			should contain .title and .data
	**/
	function loadSideBarData(baseNode, piChartElement, otherInfoElement) {
		//TODO
	}
} 


/**
	Handles zooming stuff. Specifically trigerrs zoom behavior. 

	@param: selection; d3 element (svg); passed in by select call
	@param: networkContainer; d3 element (g); element that contains the map in question 
**/
function zoom(selection, networkContainer) {
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

