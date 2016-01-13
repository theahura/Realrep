/**
	@author: Amol Kapoor
	@date: 11-9-15
	@version: 0.1

	Description: Loads user data for presentation by d3
*/

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
  
	console.log(nodes.length)
	var counter = 0;

	for(node in nodes) {

		if(nodes[node].center) {
			continue;
		}

		//if(nodes[node].value < Math.floor(global_friendsListUnmodified.length/5))
		//	continue; 

		deferred = new $.Deferred();

		socket.emit('clientToServer', {
			name: 'getHashtag',
			hash: nodes[node].label
		}, function(data, err) {

			if(err) {
				console.log(err);
			} else if(!data) {
				console.log('no data found');
			} else {
				console.log('got data')
				var currentLoadingNodeLabel = data['hashtag']['S'];

				var dataObj = stripDynamoSettings(data);

				var sortedKeys = Object.keys(dataObj).sort(function(a,b){return dataObj[a]-dataObj[b]});

				for(index in sortedKeys) {

					if(sortedKeys[index] === currentLoadingNodeLabel) 
						continue;


					if(reverseNodes[sortedKeys[index]] !== undefined) {

						if(nodes[reverseNodes[sortedKeys[index]]].layer <= 1)
							continue;

						nodes[reverseNodes[sortedKeys[index]]].value[currentLoadingNodeLabel] = dataObj[sortedKeys[index]];
						edges.push({source: reverseNodes[sortedKeys[index]], target: reverseNodes[currentLoadingNodeLabel]});
					} else {

						var node = {
							layer: 2, 
							label: sortedKeys[index], 
							value: {}, 
							color: 'blue',
							size: Math.max(20, dataObj[sortedKeys[index]])
						}

						node.value[currentLoadingNodeLabel] = dataObj[sortedKeys[index]];

						nodes.push(node);

						reverseNodes[sortedKeys[index]] = nodes.length - 1;

						edges.push({source: nodes.length - 1, target: reverseNodes[currentLoadingNodeLabel]});
					}
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
function createGraph_helper(name, sortedKeys, dataObj, DOMelement, id) {
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

	var friendLength; 
		
	if(id) {
		if(id === global_ID) {
			friendLength = global_friendsListUnmodified.length;
		} else {
			friendLength = currentLoadedFriend.friendLength;
		}			
	} else {
		friendLength = Math.floor((dataObj[sortedKeys[0]] + dataObj[sortedKeys[sortedKeys.length - 1]])/2 * 5);
	}

	for(index in sortedKeys) {
		if(sortedKeys[index] === name)
			continue;

		index = parseInt(index);
		
		var node = {
			layer: 1, 
			label: sortedKeys[index], 
			value: dataObj[sortedKeys[index]], 
			size: Math.max(20, dataObj[sortedKeys[index]])
		}

		if(node.value < Math.floor(friendLength/5))
			node.color = 'grey';
		else
			node.color = 'red';

		nodes.push(node);
			
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
	@param: piChartElement; html element; where to load the pi chart
	@param: otherDataElement; html element; where to load the other data info display
		should have a .title and a .data section underneath 
*/
function loadProfileMap(DOMelement, id, command, piChartElement, otherDataElement) {
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

				createGraph_helper(name, sortedKeys, dataObj, DOMelement, id);

			});	
		}
		else {
			createGraph_helper(id, sortedKeys, dataObj, DOMelement);
		} 

	});
}